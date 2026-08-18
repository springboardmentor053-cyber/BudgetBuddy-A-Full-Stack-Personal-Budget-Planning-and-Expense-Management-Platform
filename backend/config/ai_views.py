import json
import logging
import os
from django.conf import settings
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from google import genai
from google.genai import types

from .models import Expense, Income

logger = logging.getLogger(__name__)

class AIChatPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = str(request.data.get("message", "")).strip()
        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # 1. Fetch user's actual database records
        total_income = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        net_balance = total_income - total_expense

        # Category breakdown for spending analysis
        category_breakdown = list(
            Expense.objects.filter(user=request.user)
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        recent_expenses = list(
            Expense.objects.filter(user=request.user)
            .order_by('-expense_date')[:8]
            .values('title', 'amount', 'category', 'expense_date')
        )

        has_data = (total_income > 0) or (total_expense > 0) or (len(recent_expenses) > 0)

        # 2. System Instructions with complete guidance
        system_instruction = f"""
You are BudgetBuddy AI, an expert, encouraging, and analytical personal finance advisor.

User Financial Snapshot:
- Total Income: ₹{total_income}
- Total Expenses: ₹{total_expense}
- Net Balance: ₹{net_balance}
- Spending by Category: {json.dumps(category_breakdown, default=str)}
- Recent Expenses: {json.dumps(recent_expenses, default=str)}
- Has Recorded Data: {has_data}

Rules:
1. ONLY discuss personal finance, budgeting, spending habits, and BudgetBuddy user data. Politely decline any off-topic questions.
2. If Has Recorded Data is False or totals are ₹0:
   - State clearly that no transactions have been logged yet.
   - Explain how to categorize expenses effectively once added, and suggest standard budget allocations (e.g., 50/30/20 rule).
3. If Has Recorded Data is True:
   - Pinpoint the exact categories where the user spends the most using the provided category breakdown.
   - Give 2-3 concise, actionable steps to reduce spending in those specific areas.
4. Keep the response complete, clean, and never cut off mid-sentence.
"""

        try:
            api_key = getattr(settings, "GEMINI_API_KEY", None) or os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return Response({"reply": "Gemini API key is not configured on the server."}, status=500)

            client = genai.Client(api_key=api_key)

            # Use gemini-2.5-flash with a generous token ceiling
            chat = client.chats.create(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )

            response = chat.send_message(user_message)
            return Response({"reply": response.text})

        except Exception as e:
            logger.error(f"AI Chat Error: {str(e)}")
            return Response({"reply": f"Unable to generate response: {str(e)}"}, status=500)