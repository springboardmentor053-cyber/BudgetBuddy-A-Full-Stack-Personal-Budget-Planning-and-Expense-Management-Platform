from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.core.mail import send_mail
from django.conf import settings

from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense
from notifications.models import Notification


class BudgetViewSet(viewsets.ModelViewSet):

    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(
            user=self.request.user
        )

    # ==========================================================
    # CREATE NOTIFICATION + SEND ONE EMAIL
    # ==========================================================

    def create_notification(
        self,
        title,
        message,
        notification_type="BUDGET",
        priority="MEDIUM"
    ):

        user = self.request.user

        # ------------------------------------------
        # Create ONE in-app notification
        # ------------------------------------------

        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority
        )

        # ------------------------------------------
        # Send ONE email for that notification
        # ------------------------------------------

        if user.email:

            send_mail(
                subject=f"Budget Buddy - {title}",

                message=(
                    f"Hello {user.username},\n\n"
                    f"You have a new notification from Budget Buddy.\n\n"
                    f"Title: {title}\n\n"
                    f"Message:\n{message}\n\n"
                    f"Priority: {priority}\n"
                    f"Type: {notification_type}\n\n"
                    f"Regards,\n"
                    f"Budget Buddy"
                ),

                from_email=settings.DEFAULT_FROM_EMAIL,

                recipient_list=[user.email],

                fail_silently=False,
            )

        return notification

    # ==========================================================
    # CREATE BUDGET
    # ==========================================================

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )

        self.create_notification(
            title="Budget Created",
            message="Your budget has been created successfully.",
            notification_type="BUDGET",
            priority="MEDIUM"
        )

    # ==========================================================
    # UPDATE BUDGET
    # ==========================================================

    def perform_update(self, serializer):

        serializer.save()

        self.create_notification(
            title="Budget Updated",
            message="Your budget has been updated successfully.",
            notification_type="BUDGET",
            priority="MEDIUM"
        )

    # ==========================================================
    # BUDGET SUMMARY
    # ==========================================================

    @action(detail=False, methods=["get"])
    def summary(self, request):

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("budget_amount")
        )["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        remaining_budget = total_budget - total_expense

        overspent_amount = (
            abs(remaining_budget)
            if remaining_budget < 0
            else 0
        )

        return Response({

            "budget_amount": total_budget,

            "total_expense": total_expense,

            "remaining_budget": remaining_budget,

            "overspent_amount": overspent_amount

        })

    # ==========================================================
    # BUDGET ALERT
    # ==========================================================

    @action(detail=False, methods=["get"])
    def budget_alert(self, request):

        category = request.query_params.get("category")

        if not category:

            return Response({
                "message":
                    "Please provide category. "
                    "Example: ?category=FOOD"
            }, status=400)

        budget = Budget.objects.filter(
            user=request.user,
            category=category
        ).first()

        if not budget:

            return Response({
                "message":
                    "No budget found for this category."
            }, status=404)

        total_expense = Expense.objects.filter(
            user=request.user,
            category=category
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        if budget.budget_amount == 0:

            utilization = 0

        else:

            utilization = (
                total_expense /
                budget.budget_amount
            ) * 100

        if utilization >= 100:

            alert_level = "Budget Exceeded"

            alert_message = (
                f"Your {budget.category} "
                f"budget has been exceeded."
            )

        elif utilization >= 90:

            alert_level = "High Warning"

            alert_message = (
                f"You have used 90% of your "
                f"monthly {budget.category} budget."
            )

        elif utilization >= 80:

            alert_level = "Warning"

            alert_message = (
                f"You have used 80% of your "
                f"monthly {budget.category} budget."
            )

        else:

            alert_level = "Safe"

            alert_message = (
                "Your budget is within the limit."
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
                alert_message

        })