from decimal import Decimal

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal


# =========================================================
# FINANCIAL SUMMARY API
# =========================================================

class FinancialSummaryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # -------------------------------------------------
        # TOTAL INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # TOTAL EXPENSE
        # -------------------------------------------------

        total_expense = (
            Expense.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # CURRENT BALANCE
        # -------------------------------------------------

        current_balance = (
            total_income -
            total_expense
        )

        # -------------------------------------------------
        # TOTAL SAVINGS
        # -------------------------------------------------

        total_savings = (
            SavingsGoal.objects
            .filter(user=user)
            .aggregate(
                total=Sum("saved_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # TOTAL BUDGET
        # -------------------------------------------------

        total_budget = (
            Budget.objects
            .filter(user=user)
            .aggregate(
                total=Sum("budget_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # REMAINING BUDGET
        # -------------------------------------------------

        remaining_budget = (
            total_budget -
            total_expense
        )

        return Response({

            "total_income":
                total_income,

            "total_expense":
                total_expense,

            "current_balance":
                current_balance,

            "total_savings":
                total_savings,

            "remaining_budget":
                remaining_budget,

        })


# =========================================================
# CATEGORY-WISE EXPENSE ANALYSIS
# =========================================================

class CategoryExpenseAnalysisView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        category_expenses = list(

            Expense.objects
            .filter(user=user)
            .values("category")
            .annotate(
                total_expense=Sum("amount")
            )
            .order_by("-total_expense")

        )

        return Response({

            "category_expenses":
                category_expenses

        })