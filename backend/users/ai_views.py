import json
import logging
import os
from django.conf import settings
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from groq import Groq

from .models import Expense, Income

logger = logging.getLogger(__name__)


class AIChatPortalView(APIView):
    """
    BudgetBuddy AI Advisor View using dynamic Groq model discovery and prioritized fallback.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = str(request.data.get("message", "")).strip()
        if not user_message:
            return Response({"error": "Message is required."}, status=400)
        if len(user_message) > 2_000:
            return Response({"error": "Message must be 2,000 characters or fewer."}, status=400)

        api_key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY", "")
        if not api_key:
            logger.error("GROQ_API_KEY is not configured.")
            return Response(
                {"error": "AI advice service is not configured. Please check backend settings."},
                status=503,
            )

        # 1. Aggregate user financial data
        raw_income = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        raw_expense = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        total_income = float(raw_income)
        total_expense = float(raw_expense)
        net_balance = total_income - total_expense

        # Spending breakdown by category
        raw_categories = list(
            Expense.objects.filter(user=request.user)
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        category_breakdown = [
            {"category": item['category'], "total": float(item['total'] or 0)}
            for item in raw_categories
        ]

        # Recent expenses by date
        raw_recent = list(
            Expense.objects.filter(user=request.user)
            .order_by('-expense_date')[:6]
            .values('title', 'amount', 'category', 'expense_date')
        )
        recent_expenses = [
            {
                "title": r['title'],
                "amount": float(r['amount'] or 0),
                "category": r['category'],
                "date": str(r['expense_date']),
            }
            for r in raw_recent
        ]

        # Single biggest individual expenses by amount
        raw_biggest = list(
            Expense.objects.filter(user=request.user)
            .order_by('-amount')[:5]
            .values('title', 'amount', 'category', 'expense_date')
        )
        biggest_expenses = [
            {
                "title": b['title'],
                "amount": float(b['amount'] or 0),
                "category": b['category'],
                "date": str(b['expense_date']),
            }
            for b in raw_biggest
        ]

        has_recorded_data = bool(total_income > 0 or total_expense > 0 or recent_expenses)

        # 2. System Instructions
        system_instruction = f"""
You are BudgetBuddy AI: an encouraging, highly practical, and analytical personal finance advisor.

CORE RULES:
- ONLY answer questions regarding personal finance, budgeting, saving money, expense tracking, and user account metrics.
- Politely decline any non-finance queries in one short sentence.

USER FINANCIAL DATA:
- Has Logged Data: {has_recorded_data}
- Total Income: ₹{total_income:,.2f}
- Total Expense: ₹{total_expense:,.2f}
- Net Balance: ₹{net_balance:,.2f}
- Spending Breakdown by Category: {json.dumps(category_breakdown)}
- Recent Expenses (Chronological): {json.dumps(recent_expenses)}
- Top Biggest Single Expenses: {json.dumps(biggest_expenses)}

RESPONSE FORMATTING:
1. Answer the user's question directly in the first sentence using their exact data figures.
2. Provide 2-3 concise bullet points with actionable context or saving advice.
3. Keep the response complete, clean, and well-structured.
""".strip()

        # 3. Call Groq with dynamic discovery and fallback
        try:
            client = Groq(api_key=api_key)

            # Preferred production models in order
            preferred_models = [
                "mixtral-8x7b-32768",
                "gemma2-9b-it",
                "llama-3.1-70b-versatile",
                "llama-3.1-8b-instant",
            ]

            # Fetch all models currently accessible to your key
            live_models = [m.id for m in client.models.list().data]

            # Exclude speech, vision, guard, and proprietary third-party models
            excluded = ("whisper", "tts", "guard", "vision", "canopylabs", "orpheus")
            eligible_models = [
                m for m in live_models 
                if not any(ex in m.lower() for ex in excluded)
            ]

            # Prioritize preferred models first, then fall back to any eligible chat model
            candidates = [m for m in preferred_models if m in eligible_models]
            for m in eligible_models:
                if m not in candidates:
                    candidates.append(m)

            if not candidates:
                raise RuntimeError("No available chat completion models found in your Groq account.")

            completion = None
            last_error = None

            for model_id in candidates:
                try:
                    logger.info("Attempting Groq model: %s", model_id)
                    completion = client.chat.completions.create(
                        model=model_id,
                        messages=[
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": user_message},
                        ],
                        temperature=0.6,
                        max_tokens=1024,
                    )
                    logger.info("Successfully generated reply with model: %s", model_id)
                    break
                except Exception as err:
                    logger.warning("Failed with model %s: %s", model_id, err)
                    last_error = err
                    continue

            if not completion:
                raise last_error or RuntimeError("All candidate Groq models failed.")

            reply = completion.choices[0].message.content.strip()
            return Response({"reply": reply})

        except Exception as exc:
            logger.exception("Groq API failure for user_id=%s: %s", request.user.id, exc)
            return Response(
                {"error": f"AI service error: {str(exc)}"},
                status=503,
            )