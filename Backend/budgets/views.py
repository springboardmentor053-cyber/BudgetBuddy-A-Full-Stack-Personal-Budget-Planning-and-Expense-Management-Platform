from decimal import Decimal

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Sum
from django.shortcuts import get_object_or_404

from expenses.models import Expense
from income.models import Income
from notifications.models import Notification

from .models import Budget
from .serializers import BudgetSerializer


# =========================================================
# BUDGET ALERT LOGIC
# =========================================================

def check_budget_alert(expense):

    user = expense.user
    category = expense.category

    # -----------------------------------------------------
    # Find the budget for the expense month/year/category
    # -----------------------------------------------------

    budget = Budget.objects.filter(
        user=user,
        category=category,
        month__iexact=expense.expense_date.strftime("%B"),
        year=expense.expense_date.year
    ).first()

    if not budget:
        return

    # -----------------------------------------------------
    # Calculate total expense for this budget period
    # -----------------------------------------------------

    total_expense = Expense.objects.filter(
        user=user,
        category=budget.category,
        expense_date__year=budget.year,
        expense_date__month=expense.expense_date.month
    ).aggregate(
        total=Sum("amount")
    )["total"] or Decimal("0.00")

    # -----------------------------------------------------
    # Prevent division by zero
    # -----------------------------------------------------

    if budget.budget_amount <= 0:
        return

    # -----------------------------------------------------
    # Budget utilization
    # -----------------------------------------------------

    utilization = (
        total_expense /
        budget.budget_amount
    ) * Decimal("100")

    # -----------------------------------------------------
    # Determine alert level
    # -----------------------------------------------------

    if utilization >= 100:

        threshold = "100"

        title = "Budget Exceeded"

        message = (
            f"Your {budget.category} budget has been exceeded. "
            f"You have spent ₹{total_expense} out of "
            f"₹{budget.budget_amount}."
        )

        notification_type = "ALERT"

    elif utilization >= 90:

        threshold = "90"

        title = "High Budget Warning"

        message = (
            f"You have used {round(float(utilization), 2)}% "
            f"of your {budget.category} budget for "
            f"{budget.month}."
        )

        notification_type = "WARNING"

    elif utilization >= 80:

        threshold = "80"

        title = "Budget Warning"

        message = (
            f"You have used {round(float(utilization), 2)}% "
            f"of your {budget.category} budget for "
            f"{budget.month}."
        )

        notification_type = "WARNING"

    else:

        return

    # -----------------------------------------------------
    # Unique notification identifier
    #
    # The title contains the threshold/category/period.
    # Therefore the same threshold cannot be created twice
    # for the same budget period.
    # -----------------------------------------------------

    unique_title = (
        f"{title} - "
        f"{budget.category} - "
        f"{budget.month} {budget.year}"
    )

    # -----------------------------------------------------
    # Prevent duplicate notification
    # -----------------------------------------------------

    already_exists = Notification.objects.filter(
        user=user,
        title=unique_title
    ).exists()

    if already_exists:
        return

    # -----------------------------------------------------
    # Create notification
    # -----------------------------------------------------

    Notification.objects.create(
        user=user,
        title=unique_title,
        message=message,
        notification_type=notification_type,
        is_read=False
    )


# =========================================================
# BUDGET LIST + CREATE
# =========================================================

class BudgetListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = BudgetSerializer
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Budget.objects.filter(
            user=self.request.user
        ).order_by(
            "-year",
            "-id"
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


# =========================================================
# BUDGET DETAIL
# =========================================================

class BudgetDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = BudgetSerializer
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Budget.objects.filter(
            user=self.request.user
        )


# =========================================================
# BUDGET SUMMARY
# =========================================================

class BudgetSummaryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request, pk):

        budget = get_object_or_404(
            Budget,
            pk=pk,
            user=request.user
        )

        total_expense = Expense.objects.filter(
            user=request.user,
            category=budget.category,
            expense_date__year=budget.year,
            expense_date__month=(
                list(
                    __import__("calendar").month_name
                ).index(budget.month)
            )
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        remaining_budget = (
            budget.budget_amount -
            total_expense
        )

        overspent_amount = Decimal("0.00")

        if remaining_budget < 0:

            overspent_amount = abs(
                remaining_budget
            )

            remaining_budget = Decimal("0.00")

        return Response({

            "budget_amount":
                budget.budget_amount,

            "total_expense":
                total_expense,

            "remaining_budget":
                remaining_budget,

            "overspent_amount":
                overspent_amount

        })


# =========================================================
# DASHBOARD
# =========================================================

class TransactionDashboardView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("budget_amount")
        )["total"] or Decimal("0.00")

        current_balance = (
            total_income -
            total_expense
        )

        remaining_budget = (
            total_budget -
            total_expense
        )

        recent_expenses = list(
            Expense.objects.filter(
                user=request.user
            )
            .values(
                "id",
                "title",
                "amount",
                "category",
                "expense_date"
            )
            .order_by(
                "-expense_date",
                "-id"
            )[:5]
        )

        expense_analytics = list(
            Expense.objects.filter(
                user=request.user
            )
            .values("category")
            .annotate(
                total=Sum("amount")
            )
            .order_by("-total")
        )

        income_vs_expense = [

            {
                "name": "Income",
                "amount": total_income
            },

            {
                "name": "Expense",
                "amount": total_expense
            }

        ]

        return Response({

            "total_income":
                total_income,

            "total_expense":
                total_expense,

            "current_balance":
                current_balance,

            "total_budget":
                total_budget,

            "remaining_budget":
                remaining_budget,

            "recent_transactions":
                recent_expenses,

            "expense_analytics":
                expense_analytics,

            "income_vs_expense":
                income_vs_expense

        })