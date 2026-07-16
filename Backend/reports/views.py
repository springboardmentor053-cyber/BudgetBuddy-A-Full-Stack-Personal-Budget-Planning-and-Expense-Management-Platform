from rest_framework.views import APIView
from rest_framework.response import Response

from income.models import Income
from expenses.models import Expense


class DashboardView(APIView):

    def get(self, request):

        total_income = sum(
            income.amount for income in Income.objects.all()
        )

        total_expense = sum(
            expense.amount for expense in Expense.objects.all()
        )

        total_savings = total_income - total_expense

        data = {
            "Total Income": total_income,
            "Total Expenses": total_expense,
            "Total Savings": total_savings,
            "Income Transactions": Income.objects.count(),
            "Expense Transactions": Expense.objects.count(),
        }

        return Response(data)