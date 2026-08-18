from decimal import Decimal
import calendar

from django.db.models import Sum

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from budgets.models import Budget
from notifications.models import Notification
from notifications.email_service import send_notification_email

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    # =====================================================
    # GET EXPENSES
    # =====================================================

    def get_queryset(self):

        queryset = Expense.objects.filter(
            user=self.request.user
        )

        # Category Filter
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(
                category=category
            )

        # Sorting
        sort = self.request.query_params.get("sort")

        if sort == "latest":

            queryset = queryset.order_by("-date")

        elif sort == "oldest":

            queryset = queryset.order_by("date")

        elif sort == "highest":

            queryset = queryset.order_by("-amount")

        elif sort == "lowest":

            queryset = queryset.order_by("amount")

        return queryset

    # =====================================================
    # ADD EXPENSE
    # =====================================================

    def perform_create(self, serializer):

        expense = serializer.save(
            user=self.request.user
        )

        notification = Notification.objects.create(

            user=self.request.user,

            title="Expense Added",

            message=(
                f"Your {expense.category} expense "
                f"of ₹{expense.amount} "
                f"was added successfully."
            ),

            notification_type="expense_added",

            priority="low",
        )

        # Send email
        send_notification_email(notification)

        # Check budget after adding expense
        self.check_budget_alert(expense)

    # =====================================================
    # UPDATE EXPENSE
    # =====================================================

    def perform_update(self, serializer):

        expense = serializer.save()

        notification = Notification.objects.create(

            user=self.request.user,

            title="Expense Updated",

            message=(
                f"Your {expense.category} expense "
                f"of ₹{expense.amount} "
                f"was updated successfully."
            ),

            notification_type="expense_updated",

            priority="low",
        )

        # Send email
        send_notification_email(notification)

        # Check budget after update
        self.check_budget_alert(expense)

    # =====================================================
    # DELETE EXPENSE
    # =====================================================

    def perform_destroy(self, instance):

        # Save information before deletion
        amount = instance.amount
        category = instance.category

        notification = Notification.objects.create(

            user=self.request.user,

            title="Expense Deleted",

            message=(
                f"Your {category} expense "
                f"of ₹{amount} "
                f"was deleted successfully."
            ),

            notification_type="expense_deleted",

            priority="medium",
        )

        # Send email
        send_notification_email(notification)

        # Delete expense
        instance.delete()

    # =====================================================
    # BUDGET ALERT
    # =====================================================

    def check_budget_alert(self, expense):

        expense_month = calendar.month_name[
            expense.date.month
        ]

        expense_year = expense.date.year

        budget = Budget.objects.filter(

            user=self.request.user,

            category=expense.category,

            month=expense_month,

            year=expense_year,

        ).first()

        if not budget:
            return

        total_expense = (

            Expense.objects.filter(

                user=self.request.user,

                category=expense.category,

                date__month=expense.date.month,

                date__year=expense.date.year,

            )

            .aggregate(
                total=Sum("amount")
            )["total"]

            or Decimal("0")
        )

        # Avoid division by zero
        if budget.budget_amount <= 0:
            return

        utilization = (
            total_expense /
            budget.budget_amount
        ) * 100

        # =================================================
        # 80% WARNING
        # =================================================

        if (
            utilization >= 80
            and not budget.alert_80_sent
        ):

            notification = Notification.objects.create(

                user=self.request.user,

                title="Budget Warning",

                message=(
                    f"Warning: You have used 80% "
                    f"of your monthly "
                    f"{budget.category} budget."
                ),

                notification_type="budget_warning",

                priority="medium",
            )

            send_notification_email(notification)

            budget.alert_80_sent = True

            budget.save()

        # =================================================
        # 90% WARNING
        # =================================================

        if (
            utilization >= 90
            and not budget.alert_90_sent
        ):

            notification = Notification.objects.create(

                user=self.request.user,

                title="High Budget Warning",

                message=(
                    f"High Alert: You have used 90% "
                    f"of your monthly "
                    f"{budget.category} budget."
                ),

                notification_type="budget_warning",

                priority="high",
            )

            send_notification_email(notification)

            budget.alert_90_sent = True

            budget.save()

        # =================================================
        # 100% BUDGET EXCEEDED
        # =================================================

        if (
            utilization >= 100
            and not budget.alert_100_sent
        ):

            notification = Notification.objects.create(

                user=self.request.user,

                title="Budget Exceeded",

                message=(
                    f"Budget Exceeded: Your "
                    f"{budget.category} budget "
                    f"has been exceeded."
                ),

                notification_type="budget_exceeded",

                priority="high",
            )

            send_notification_email(notification)

            budget.alert_100_sent = True

            budget.save()


# =========================================================
# TOTAL EXPENSE
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def total_expense(request):

    total = (

        Expense.objects

        .filter(
            user=request.user
        )

        .aggregate(
            total=Sum("amount")
        )["total"]

        or 0
    )

    return Response({

        "total_expense": total

    })