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

    # =====================================================
    # GET USER'S BUDGETS
    # =====================================================

    def get_queryset(self):

        return Budget.objects.filter(
            user=self.request.user
        )

    # =====================================================
    # CREATE BUDGET
    # =====================================================

    def perform_create(self, serializer):

        budget = serializer.save(
            user=self.request.user
        )

        notification = Notification.objects.create(

            user=self.request.user,

            title="Budget Created",

            message=(
                f"Your budget for "
                f"'{budget.category}' "
                f"has been created successfully."
            ),

            notification_type="budget_created",

            priority="medium",
        )

        send_notification_email(notification)

    # =====================================================
    # UPDATE BUDGET
    # =====================================================

    def perform_update(self, serializer):

        budget = serializer.save()

        notification = Notification.objects.create(

            user=self.request.user,

            title="Budget Updated",

            message=(
                f"Your budget for "
                f"'{budget.category}' "
                f"has been updated successfully."
            ),

            notification_type="budget_updated",

            priority="medium",
        )

        send_notification_email(notification)

    # =====================================================
    # DELETE BUDGET
    # =====================================================

    def perform_destroy(self, instance):

        category = instance.category
        amount = instance.budget_amount
        month = instance.month
        year = instance.year

        notification = Notification.objects.create(

            user=self.request.user,

            title="Budget Deleted",

            message=(
                f"Your {category} budget of "
                f"₹{amount} for {month} {year} "
                f"was deleted successfully."
            ),

            notification_type="budget_deleted",

            priority="medium",
        )

        send_notification_email(notification)

        instance.delete()

    # =====================================================
    # PREVENT DUPLICATE BUDGET
    # =====================================================

    def create(self, request, *args, **kwargs):

        category = request.data.get("category")
        month = request.data.get("month")
        year = request.data.get("year")

        if Budget.objects.filter(

            user=request.user,

            category=category,

            month=month,

            year=year,

        ).exists():

            return Response(

                {
                    "error":
                    "Budget already exists for this category and month."
                },

                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(
            request,
            *args,
            **kwargs
        )


# =========================================================
# BUDGET SUMMARY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_summary(request, category):

    budget = Budget.objects.filter(

        user=request.user,

        category=category,

    ).first()

    if not budget:

        return Response(

            {
                "error": "Budget not found"
            },

            status=404,
        )

    total_expense = (

        Expense.objects.filter(

            user=request.user,

            category=category,

        )

        .aggregate(
            total=Sum("amount")
        )["total"]

        or 0
    )

    remaining_budget = (
        budget.budget_amount -
        total_expense
    )

    overspent_amount = 0

    if remaining_budget < 0:

        overspent_amount = abs(
            remaining_budget
        )

    return Response({

        "category":
            budget.category,

        "budget_amount":
            budget.budget_amount,

        "total_expense":
            total_expense,

        "remaining_budget":
            remaining_budget,

        "overspent_amount":
            overspent_amount,

    })


# =========================================================
# BUDGET ALERT
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_alert(request, category):

    budget = Budget.objects.filter(

        user=request.user,

        category=category

    ).first()

    if not budget:

        return Response(

            {
                "error": "Budget not found"
            },

            status=404
        )

    total_expense = (

        Expense.objects.filter(

            user=request.user,

            category=category

        )

        .aggregate(
            total=Sum("amount")
        )["total"]

        or 0
    )

    if budget.budget_amount <= 0:

        return Response({

            "budget_category":
                budget.category,

            "budget_amount":
                budget.budget_amount,

            "total_expense":
                total_expense,

            "budget_utilization_percentage":
                0,

            "alert_level":
                "Invalid",

            "alert_message":
                "Budget amount must be greater than zero.",

        })

    utilization = (

        total_expense /
        budget.budget_amount

    ) * 100


    # =====================================================
    # 100%
    # =====================================================

    if utilization >= 100:

        alert_level = "Exceeded"

        alert_message = (
            f"Budget Exceeded: "
            f"Your {category} budget "
            f"has been exceeded."
        )


    # =====================================================
    # 90%
    # =====================================================

    elif utilization >= 90:

        alert_level = "High Warning"

        alert_message = (
            f"High Alert: You have used "
            f"90% of your monthly "
            f"{category} budget."
        )


    # =====================================================
    # 80%
    # =====================================================

    elif utilization >= 80:

        alert_level = "Warning"

        alert_message = (
            f"Warning: You have used "
            f"80% of your monthly "
            f"{category} budget."
        )


    # =====================================================
    # SAFE
    # =====================================================

    else:

        alert_level = "Safe"

        alert_message = (
            "Your budget is within "
            "the safe limit."
        )


    return Response({

        "budget_category":
            budget.category,

        "budget_amount":
            budget.budget_amount,

        "total_expense":
            total_expense,

        "budget_utilization_percentage":
            round(utilization, 2),

        "alert_level":
            alert_level,

        "alert_message":
            alert_message,

    })