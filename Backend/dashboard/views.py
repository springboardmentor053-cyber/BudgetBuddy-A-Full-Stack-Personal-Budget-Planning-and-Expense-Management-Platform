from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget


class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ==========================================
        # Total Income
        # ==========================================

        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        # ==========================================
        # Total Expense
        # ==========================================

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        # ==========================================
        # Total Budget
        # ==========================================

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("budget_amount")
        )["total"] or 0

        # ==========================================
        # Current Balance
        # ==========================================

        current_balance = total_income - total_expense

        # ==========================================
        # Remaining Budget
        # ==========================================

        remaining_budget = total_budget - total_expense

        # ==========================================
        # Budget Status
        # ==========================================

        if remaining_budget >= 0:
            budget_status = "Within Budget"
        else:
            budget_status = "Budget Exceeded"

        # ==========================================
        # Recent Expenses
        # ==========================================

        recent_expenses = Expense.objects.filter(
            user=request.user
        ).order_by("-date")[:5]

        # ==========================================
        # Recent Income
        # ==========================================

        recent_income = Income.objects.filter(
            user=request.user
        ).order_by("-income_date")[:5]

        # ==========================================
        # Combine Transactions
        # ==========================================

        recent_transactions = []

        # Expense Transactions

        for expense in recent_expenses:

            recent_transactions.append({

                "type": "Expense",
                "category": expense.category,
                "amount": expense.amount,
                "date": expense.date

            })

        # Income Transactions

        for income in recent_income:

            recent_transactions.append({

                "type": "Income",
                "title": income.title,
                "source": income.source,
                "amount": income.amount,
                "date": income.income_date

            })

        # ==========================================
        # Sort Transactions
        # ==========================================

        recent_transactions = sorted(
            recent_transactions,
            key=lambda x: x["date"],
            reverse=True
        )

        # ==========================================
        # Response
        # ==========================================

        return Response({

            "financial_summary": {

                "total_income": total_income,
                "total_expense": total_expense,
                "current_balance": current_balance,
                "remaining_budget": remaining_budget

            },

            "total_budget": total_budget,

            "budget_status": budget_status,

            "recent_transactions": recent_transactions[:5]

        })