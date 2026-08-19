import json
import logging
import os
import re
from datetime import date
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
    BudgetBuddy AI Advisor View with strict conversational model selection,
    robust reasoning tag stripping, date-awareness, and zero-hallucination guardrails.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = str(request.data.get("message", "")).strip()
        history = request.data.get("history", [])

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

        # Recent expenses (fetch up to 40 records to cover date queries accurately)
        raw_recent = list(
            Expense.objects.filter(user=request.user)
            .order_by('-expense_date')[:40]
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

        # Top single expenses
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
        current_date_str = str(date.today())

        # 2. Strict, Grounded System Instructions
        system_instruction = f"""
You are BudgetBuddy AI: a strict, data-grounded personal finance assistant.

CRITICAL ACCURACY & GROUNDING RULES:
1. Use ONLY the data provided below. NEVER invent, hallucinate, or assume transactions (e.g., do not make up "mess", "hostel fee", or placeholder figures).
2. Today's Date is: {current_date_str}. Use this to accurately resolve relative terms like "today", "yesterday", or specific dates.
3. For date-specific queries or follow-up elaboration:
   - Filter the RECENT_TRANSACTIONS list for the requested date.
   - List each actual transaction as: • [Title] ([Category]): ₹[Amount]
   - State the exact total sum for that day.
4. For general overview queries, provide a direct 1-2 sentence summary with exact ₹ amounts.
5. DO NOT output any <think> tags, analysis scratchpads, or checklists. Output only the final response.
6. Only answer personal finance queries.

USER FINANCIAL DATA:
- Has Logged Data: {has_recorded_data}
- Total Income: ₹{total_income:,.2f}
- Total Expense: ₹{total_expense:,.2f}
- Net Balance: ₹{net_balance:,.2f}
- Category Breakdown: {json.dumps(category_breakdown)}
- RECENT_TRANSACTIONS: {json.dumps(recent_expenses)}
- TOP_EXPENSES: {json.dumps(biggest_expenses)}
""".strip()

        # Build message history
        messages_payload = [{"role": "system", "content": system_instruction}]

        if isinstance(history, list):
            for h in history[-4:]:
                if isinstance(h, dict) and h.get("role") in ("user", "assistant") and h.get("content"):
                    clean_content = re.sub(r'<think>.*?(?:</think>|$)', '', str(h["content"]), flags=re.DOTALL).strip()
                    if clean_content:
                        messages_payload.append({
                            "role": h["role"],
                            "content": clean_content
                        })

        messages_payload.append({"role": "user", "content": user_message})

        # 3. Dynamic Groq Model Selection with Fallback
        try:
            client = Groq(api_key=api_key)

            preferred_models = [
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768",
                "gemma2-9b-it",
            ]

            live_models = [m.id for m in client.models.list().data]
            
            excluded = ("whisper", "tts", "guard", "vision", "canopylabs", "orpheus", "r1", "deepseek", "distill", "reasoner")
            eligible_models = [
                m for m in live_models 
                if not any(ex in m.lower() for ex in excluded)
            ]

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
                    completion = client.chat.completions.create(
                        model=model_id,
                        messages=messages_payload,
                        temperature=0.1,  # Low temperature strictly enforces factual grounding
                        max_tokens=600,
                    )
                    break
                except Exception as err:
                    logger.warning("Failed with model %s: %s", model_id, err)
                    last_error = err
                    continue

            if not completion:
                raise last_error or RuntimeError("All candidate Groq models failed.")

            raw_reply = completion.choices[0].message.content or ""

            # Ensure all internal thinking tokens are stripped even on incomplete outputs
            clean_reply = re.sub(r'<think>.*?(?:</think>|$)', '', raw_reply, flags=re.DOTALL).strip()

            if not clean_reply:
                clean_reply = raw_reply.strip()

            return Response({"reply": clean_reply})

        except Exception as exc:
            logger.exception("Groq API failure for user_id=%s: %s", request.user.id, exc)
            return Response(
                {"error": f"AI service error: {str(exc)}"},
                status=503,
            )