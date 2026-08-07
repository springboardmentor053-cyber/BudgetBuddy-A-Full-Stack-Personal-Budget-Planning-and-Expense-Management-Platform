from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer
from notifications_app.utils import send_notification


class SavingsGoalListCreateAPIView(generics.ListCreateAPIView):
    """
    List user savings goals with optional search & status filtering, or create a new goal.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SavingsGoal.objects.filter(user=self.request.user)

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(goal_name__icontains=search)

        status_filter = self.request.query_params.get("status", "").strip()
        if status_filter:
            queryset = queryset.filter(status__iexact=status_filter)

        return queryset.order_by("-created_at" if hasattr(SavingsGoal, "created_at") else "-id")

    def perform_create(self, serializer):
        savings_goal = serializer.save(user=self.request.user)

        # 🚀 Trigger notification & email for Savings Goal
        send_notification(
            user=self.request.user,
            title="Savings Goal Created",
            message=f"New savings goal created: {savings_goal.goal_name} with a target of ₹{savings_goal.target_amount}.",
            notification_type="SAVINGS",
            priority="LOW",
        )


class SavingsGoalDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific user savings goal.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


class GoalProgressAPIView(APIView):
    """
    Returns calculated progress, remaining amounts, and percentages for user savings goals.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        goals = SavingsGoal.objects.filter(user=request.user)
        data = []

        for goal in goals:
            target = float(goal.target_amount or 0.0)
            saved = float(goal.saved_amount or 0.0)
            remaining_amount = max(0.0, target - saved)
            progress_percentage = (saved / target * 100) if target > 0 else 0.0

            data.append(
                {
                    "id": goal.id,
                    "goal_name": goal.goal_name,
                    "goal_type": getattr(goal, "goal_type", ""),
                    "target_amount": target,
                    "saved_amount": saved,
                    "remaining_amount": remaining_amount,
                    "progress_percentage": round(progress_percentage, 2),
                    "status": getattr(goal, "status", "ACTIVE"),
                    "target_date": getattr(goal, "target_date", None),
                }
            )

        return Response(data, status=status.HTTP_200_OK)
