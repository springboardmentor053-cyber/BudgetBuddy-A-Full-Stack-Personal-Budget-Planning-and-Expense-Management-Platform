from calendar import month_name

from django.db.models import Sum

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification
from notifications.email_service import send_notification_email

from .models import Income
from .serializers import IncomeSerializer

from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal

from datetime import date


class IncomeViewSet(viewsets.ModelViewSet):

    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Income.objects.filter(
            user=self.request.user
        )

    # =====================================================
    # ADD INCOME
    # =====================================================

    def perform_create(self, serializer):

        income = serializer.save(
            user=self.request.user
        )

        notification = Notification.objects.create(

            user=self.request.user,

            title="Income Added",

            message=(
                f"Income of ₹{income.amount} "
                f"from {income.source} "
                f"was added successfully."
            ),

            notification_type="income_added",

            priority="low",
        )

        send_notification_email(notification)

    # =====================================================
    # UPDATE INCOME
    # =====================================================

    def perform_update(self, serializer):

        income = serializer.save()

        notification = Notification.objects.create(

            user=self.request.user,

            title="Income Updated",

            message=(
                f"Your income of ₹{income.amount} "
                f"from {income.source} "
                f"was updated successfully."
            ),

            notification_type="income_updated",

            priority="low",
        )

        send_notification_email(notification)

    # =====================================================
    # DELETE INCOME
    # =====================================================

    def perform_destroy(self, instance):

        # Store the information before deleting
        amount = instance.amount
        source = instance.source

        notification = Notification.objects.create(

            user=self.request.user,

            title="Income Deleted",

            message=(
                f"Your income of ₹{amount} "
                f"from {source} "
                f"was deleted successfully."
            ),

            notification_type="income_deleted",

            priority="medium",
        )

        # Send email notification
        send_notification_email(notification)

        # Delete the income
        instance.delete()


# =========================================================
# FINANCIAL SUMMARY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def financial_summary(request):

    total_income = (
        Income.objects
        .filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_expense = (
        Expense.objects
        .filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    balance = total_income - total_expense

    return Response({

        "total_income": total_income,

        "total_expense": total_expense,

        "balance": balance

    })


# =========================================================
# TRANSACTION DASHBOARD
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transaction_dashboard(request):

    user = request.user

    # =====================================================
    # 1. FINANCIAL TOTALS
    # =====================================================

    total_income = (
        Income.objects
        .filter(user=user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_expense = (
        Expense.objects
        .filter(user=user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_budget = (
        Budget.objects
        .filter(user=user)
        .aggregate(total=Sum("budget_amount"))["total"]
        or 0
    )

    total_savings = (
        SavingsGoal.objects
        .filter(user=user)
        .aggregate(total=Sum("saved_amount"))["total"]
        or 0
    )

    current_balance = (
        total_income - total_expense
    )

    remaining_budget = (
        total_budget - total_expense
    )


    # =====================================================
    # 2. EXPENSE CATEGORY ANALYSIS
    # =====================================================

    category_data = (
        Expense.objects
        .filter(user=user)
        .values("category")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )

    category_analysis = list(category_data)


    # =====================================================
    # 3. LAST 6 MONTHS FINANCIAL TREND
    # =====================================================

    today = date.today()

    monthly_trend = []

    for i in range(5, -1, -1):

        month = today.month - i
        year = today.year

        while month <= 0:

            month += 12
            year -= 1


        month_income = (
            Income.objects
            .filter(
                user=user,
                income_date__month=month,
                income_date__year=year,
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )


        month_expense = (
            Expense.objects
            .filter(
                user=user,
                date__month=month,
                date__year=year,
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )


        monthly_trend.append({

            "month": month_name[month],

            "year": year,

            "income": month_income,

            "expense": month_expense,

            "balance":
                month_income - month_expense,

        })


    # =====================================================
    # 4. ACTIVE SAVINGS GOALS
    # =====================================================

    savings_goals = SavingsGoal.objects.filter(
        user=user
    ).order_by("target_date")


    active_savings_goals = []

    for goal in savings_goals:

        progress = goal.progress_percentage

        active_savings_goals.append({

            "id": goal.id,

            "goal_name": goal.goal_name,

            "target_amount": goal.target_amount,

            "saved_amount": goal.saved_amount,

            "remaining_amount": goal.remaining_amount,

            "progress_percentage": progress,

            "target_date": goal.target_date,

        })


    # =====================================================
    # 5. LATEST NOTIFICATIONS
    # =====================================================

    latest_notifications = list(

        Notification.objects
        .filter(user=user)
        .order_by("-created_at")[:5]
        .values(
            "id",
            "title",
            "message",
            "priority",
            "is_read",
            "created_at",
        )

    )


    # =====================================================
    # 6. RECENT INCOME
    # =====================================================

    recent_income = list(

        Income.objects
        .filter(user=user)
        .order_by("-id")[:5]
        .values(
            "id",
            "title",
            "source",
            "amount",
            "income_date",
        )

    )


    # =====================================================
    # 7. RECENT EXPENSES
    # =====================================================

    recent_expenses = list(

        Expense.objects
        .filter(user=user)
        .order_by("-id")[:5]
        .values(
            "id",
            "title",
            "amount",
            "category",
            "date",
        )

    )


    # =====================================================
    # 8. FINAL RESPONSE
    # =====================================================

    return Response({

        # Financial summary

        "financial_summary": {

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

            "total_savings":
                total_savings,

        },


        # Expense categories

        "category_analysis":
            category_analysis,


        # Six-month chart data

        "monthly_trend":
            monthly_trend,


        # Savings

        "active_savings_goals":
            active_savings_goals,


        # Notifications

        "latest_notifications":
            latest_notifications,


        # Recent income

        "recent_income":
            recent_income,


        # Recent expenses

        "recent_transactions":
            recent_expenses,

    })