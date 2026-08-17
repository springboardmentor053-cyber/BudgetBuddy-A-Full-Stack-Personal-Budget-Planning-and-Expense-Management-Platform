from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

from notifications.models import Notification


# ==========================================================
# Savings Goal CRUD APIs
# ==========================================================

class SavingsGoalListCreateView(generics.ListCreateAPIView):

    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):

        goal = serializer.save(
            user=self.request.user
        )

        # Automatic Notification - Savings Goal Created
        Notification.objects.create(
            user=self.request.user,
            title="Savings Goal Created",
            message=f'Your savings goal "{goal.goal_name}" has been created successfully.',
            notification_type="SAVINGS",
            priority="MEDIUM"
        )


class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):

        goal = serializer.save()

        # Automatic Completion Check
        if (
            goal.saved_amount >= goal.target_amount
            and goal.status != "COMPLETED"
        ):

            goal.status = "COMPLETED"
            goal.save()

            # Automatic Notification - Savings Goal Completed
            Notification.objects.create(
                user=self.request.user,
                title="Savings Goal Completed",
                message=f'Congratulations! You have completed your savings goal "{goal.goal_name}".',
                notification_type="SAVINGS",
                priority="HIGH"
            )


# ==========================================================
# Goal Progress API
# ==========================================================

class GoalProgressAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        goal = get_object_or_404(
            SavingsGoal,
            pk=pk,
            user=request.user
        )

        remaining_amount = goal.target_amount - goal.saved_amount

        if goal.target_amount > 0:
            progress_percentage = (
                goal.saved_amount / goal.target_amount
            ) * 100
        else:
            progress_percentage = 0

        return Response({

            "goal_name": goal.goal_name,
            "target_amount": goal.target_amount,
            "saved_amount": goal.saved_amount,
            "remaining_amount": remaining_amount,
            "progress_percentage": round(progress_percentage, 2),
            "goal_status": goal.status

        })