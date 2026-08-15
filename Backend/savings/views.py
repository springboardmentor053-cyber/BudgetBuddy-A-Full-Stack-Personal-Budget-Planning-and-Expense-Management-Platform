from rest_framework import generics

from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated

from .models import SavingsGoal

from .serializers import SavingsGoalSerializer

from notifications.models import Notification


# =========================================================
# SAVINGS GOAL LIST + CREATE
# =========================================================

class SavingsGoalListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = SavingsGoalSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return SavingsGoal.objects.filter(
            user=self.request.user
        ).order_by(
            "deadline",
            "-id"
        )

    def perform_create(self, serializer):

        # Create savings goal
        goal = serializer.save(
            user=self.request.user
        )

        # Create notification
        Notification.objects.create(

            user=self.request.user,

            title="Savings Goal Added",

            message=(
                f"Your savings goal "
                f"'{goal.goal_name}' "
                f"has been created successfully."
            ),

            notification_type="SUCCESS"
        )


# =========================================================
# SAVINGS GOAL DETAIL
# =========================================================

class SavingsGoalDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = SavingsGoalSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return SavingsGoal.objects.filter(
            user=self.request.user
        )


# =========================================================
# SAVINGS GOAL PROGRESS
# =========================================================

class SavingsGoalProgressView(
    generics.RetrieveAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        goal = self.get_object()

        target_amount = goal.target_amount

        saved_amount = goal.saved_amount

        remaining_amount = max(
            target_amount - saved_amount,
            0
        )

        if target_amount > 0:

            progress_percentage = (
                saved_amount / target_amount
            ) * 100

            progress_percentage = min(
                progress_percentage,
                100
            )

        else:

            progress_percentage = 0

        if saved_amount >= target_amount:

            status = "COMPLETED"

        else:

            status = "IN_PROGRESS"

        return Response({

            "goal_name":
                goal.goal_name,

            "target_amount":
                target_amount,

            "saved_amount":
                saved_amount,

            "remaining_amount":
                remaining_amount,

            "progress_percentage":
                round(
                    float(
                        progress_percentage
                    ),
                    2
                ),

            "status":
                status,

        })