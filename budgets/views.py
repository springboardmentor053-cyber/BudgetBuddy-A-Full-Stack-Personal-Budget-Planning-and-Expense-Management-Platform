import calendar as cal
from decimal import Decimal

from django.db.models import Sum

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from expenses.models import Expense
from notifications.models import Notification
from notifications.email_service import send_notification_email

from .models import Budget
from .serializers import BudgetSerializer


class BudgetViewSet(viewsets.ModelViewSet):

    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    # =========================================================
    # CREATE
    # =========================================================

    def perform_create(self, serializer):
        budget = serializer.save(
            user=self.request.user,
            alert_80_sent=False,
            alert_90_sent=False,
            alert_100_sent=False,
        )

        n = Notification.objects.create(
            user=self.request.user,
            title="Budget Created",
            message=f"Your budget for '{budget.category}' has been created successfully.",
            notification_type="budget_created",
            priority="medium",
        )
        send_notification_email(n)

        # Fire alerts immediately for existing expenses
        self._check_budget_alert(budget)

    # =========================================================
    # UPDATE
    # =========================================================

    def perform_update(self, serializer):
        budget = serializer.save(
            alert_80_sent=False,
            alert_90_sent=False,
            alert_100_sent=False,
        )

        n = Notification.objects.create(
            user=self.request.user,
            title="Budget Updated",
            message=f"Your budget for '{budget.category}' has been updated successfully.",
            notification_type="budget_updated",
            priority="medium",
        )
        send_notification_email(n)

        self._check_budget_alert(budget)

    # =========================================================
    # DELETE
    # =========================================================

    def perform_destroy(self, instance):
        category = instance.category
        amount = instance.budget_amount
        month = instance.month
        year = instance.year

        n = Notification.objects.create(
            user=self.request.user,
            title="Budget Deleted",
            message=f"Your {category} budget of Rs.{amount} for {month} {year} was deleted successfully.",
            notification_type="budget_deleted",
            priority="medium",
        )
        send_notification_email(n)
        instance.delete()

    # =========================================================
    # PREVENT DUPLICATE BUDGET
    # =========================================================

    def create(self, request, *args, **kwargs):
        # Let the serializer normalise month first before duplicate check
        return super().create(request, *args, **kwargs)

    # =========================================================
    # BUDGET ALERT CHECK
    # =========================================================

    def _check_budget_alert(self, budget):
        """Fire notifications when expenses cross 80/90/100% of budget."""

        # Convert month name to number (e.g. "September" -> 9)
        month_map = {name: num for num, name in enumerate(cal.month_name)}
        month_str = str(budget.month).strip().capitalize()
        month_num = month_map.get(month_str, 0)

        print(f"[BUDGET ALERT] budget.month={budget.month!r} month_str={month_str!r} month_num={month_num} year={budget.year} category={budget.category}")

        if not month_num:
            print(f"[BUDGET ALERT] Could not resolve month, skipping alert check")
            return

        total_expense = (
            Expense.objects.filter(
                user=self.request.user,
                category=budget.category,
                date__month=month_num,
                date__year=budget.year,
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )

        print(f"[BUDGET ALERT] total_expense={total_expense} budget_amount={budget.budget_amount}")

        if budget.budget_amount <= 0:
            return

        utilization = (total_expense / budget.budget_amount) * 100
        print(f"[BUDGET ALERT] utilization={utilization:.1f}%")

        # 80%
        if utilization >= 80 and not budget.alert_80_sent:
            n = Notification.objects.create(
                user=self.request.user,
                title="Budget Warning",
                message=f"Warning: You have used 80% of your monthly {budget.category} budget.",
                notification_type="budget_warning",
                priority="medium",
            )
            send_notification_email(n)
            budget.alert_80_sent = True
            budget.save(update_fields=["alert_80_sent"])
            print(f"[BUDGET ALERT] 80% alert fired")

        # 90%
        if utilization >= 90 and not budget.alert_90_sent:
            n = Notification.objects.create(
                user=self.request.user,
                title="High Budget Warning",
                message=f"High Alert: You have used 90% of your monthly {budget.category} budget.",
                notification_type="budget_warning",
                priority="high",
            )
            send_notification_email(n)
            budget.alert_90_sent = True
            budget.save(update_fields=["alert_90_sent"])
            print(f"[BUDGET ALERT] 90% alert fired")

        # 100%
        if utilization >= 100 and not budget.alert_100_sent:
            n = Notification.objects.create(
                user=self.request.user,
                title="Budget Exceeded",
                message=f"Budget Exceeded: Your {budget.category} budget has been exceeded.",
                notification_type="budget_exceeded",
                priority="high",
            )
            send_notification_email(n)
            budget.alert_100_sent = True
            budget.save(update_fields=["alert_100_sent"])
            print(f"[BUDGET ALERT] 100% alert fired")


# =========================================================
# BUDGET SUMMARY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_summary(request, category):

    budget = Budget.objects.filter(user=request.user, category=category).first()

    if not budget:
        return Response({"error": "Budget not found"}, status=404)

    total_expense = (
        Expense.objects.filter(user=request.user, category=category)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    remaining_budget = budget.budget_amount - total_expense
    overspent_amount = abs(remaining_budget) if remaining_budget < 0 else 0

    return Response({
        "category": budget.category,
        "budget_amount": budget.budget_amount,
        "total_expense": total_expense,
        "remaining_budget": remaining_budget,
        "overspent_amount": overspent_amount,
    })


# =========================================================
# BUDGET ALERT
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_alert(request, category):

    budget = Budget.objects.filter(user=request.user, category=category).first()

    if not budget:
        return Response({"error": "Budget not found"}, status=404)

    total_expense = (
        Expense.objects.filter(user=request.user, category=category)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    if budget.budget_amount <= 0:
        return Response({
            "budget_category": budget.category,
            "budget_amount": budget.budget_amount,
            "total_expense": total_expense,
            "budget_utilization_percentage": 0,
            "alert_level": "Invalid",
            "alert_message": "Budget amount must be greater than zero.",
        })

    utilization = (total_expense / budget.budget_amount) * 100

    if utilization >= 100:
        alert_level = "Exceeded"
        alert_message = f"Budget Exceeded: Your {category} budget has been exceeded."
    elif utilization >= 90:
        alert_level = "High Warning"
        alert_message = f"High Alert: You have used 90% of your monthly {category} budget."
    elif utilization >= 80:
        alert_level = "Warning"
        alert_message = f"Warning: You have used 80% of your monthly {category} budget."
    else:
        alert_level = "Safe"
        alert_message = "Your budget is within the safe limit."

    return Response({
        "budget_category": budget.category,
        "budget_amount": budget.budget_amount,
        "total_expense": total_expense,
        "budget_utilization_percentage": round(utilization, 2),
        "alert_level": alert_level,
        "alert_message": alert_message,
    })