from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from expenses.models import Expense
from income.models import Income
from budgets.models import Budget

from expenses.serializers import ExpenseSerializer
from income.serializers import IncomeSerializer


class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = (
            Income.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        current_balance = total_income - total_expense

        total_budget = (
            Budget.objects.filter(user=request.user)
            .aggregate(total=Sum("monthly_limit"))["total"] or 0
        )

        remaining_budget = total_budget - total_expense

        recent_income = Income.objects.filter(
            user=request.user
        ).order_by("-income_date")[:5]

        recent_expenses = Expense.objects.filter(
            user=request.user
        ).order_by("-expense_date")[:5]

        recent_transactions = []

        for income in recent_income:
            recent_transactions.append({
                "type": "Income",
                "title": income.title,
                "amount": income.amount,
                "date": income.income_date,
            })

        for expense in recent_expenses:
            recent_transactions.append({
                "type": "Expense",
                "title": expense.title,
                "category": expense.category,
                "amount": expense.amount,
                "date": expense.expense_date,
            })

        recent_transactions.sort(
            key=lambda x: x["date"],
            reverse=True
        )

        recent_transactions = recent_transactions[:5]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "recent_transactions": recent_transactions,
            "recent_income": IncomeSerializer(recent_income, many=True).data,
            "recent_expenses": ExpenseSerializer(recent_expenses, many=True).data,
        })
