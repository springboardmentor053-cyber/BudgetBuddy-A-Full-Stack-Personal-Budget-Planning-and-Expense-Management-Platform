from datetime import date, timedelta
from django.db.models import Sum

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

from notifications.utils import (
    goal_created,
    goal_completed,
    savings_updated,
    milestone,
    due_tomorrow,
)


class SavingsGoalListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):

        goal = serializer.save(
            user=self.request.user
        )

        # Goal Created
        goal_created(goal)

        # Goal Completed
        if goal.saved_amount >= goal.target_amount:

            goal.status = "Completed"
            goal.save()

            goal_completed(goal)

        # Due Tomorrow
        if goal.target_date == (
            date.today() + timedelta(days=1)
        ):
            due_tomorrow(goal)


class SavingsGoalDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):

        old_goal = self.get_object()
        old_saved = old_goal.saved_amount

        goal = serializer.save()

        # Money Added
        if goal.saved_amount > old_saved:

            savings_updated(
                goal,
                goal.saved_amount - old_saved
            )

        # Progress Percentage
        percentage = int(
            (goal.saved_amount / goal.target_amount) * 100
        ) if goal.target_amount else 0

        if 25 <= percentage < 50:
            milestone(goal, 25)

        elif 50 <= percentage < 75:
            milestone(goal, 50)

        elif 75 <= percentage < 100:
            milestone(goal, 75)

        elif percentage >= 100:

            if goal.status != "Completed":

                goal.status = "Completed"
                goal.save()

            goal_completed(goal)

        # Due Tomorrow
        if goal.target_date == (
            date.today() + timedelta(days=1)
        ):
            due_tomorrow(goal)


class SavingsProgressView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        goal = SavingsGoal.objects.get(
            id=pk,
            user=request.user
        )

        remaining = (
            goal.target_amount -
            goal.saved_amount
        )

        days_left = (
            goal.target_date -
            date.today()
        ).days

        progress = (
            goal.saved_amount /
            goal.target_amount
        ) * 100 if goal.target_amount > 0 else 0

        return Response({

            "goal_name": goal.goal_name,

            "target_amount": goal.target_amount,

            "saved_amount": goal.saved_amount,

            "remaining_amount": remaining,

            "progress_percentage": round(progress, 2),

            "status": goal.status,

            "days_left": days_left,

        })


class SavingsDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        goals = SavingsGoal.objects.filter(
            user=request.user
        )

        total_saved = goals.aggregate(
            Sum("saved_amount")
        )["saved_amount__sum"] or 0

        completed = goals.filter(
            status="Completed"
        ).count()

        active = goals.filter(
            status="Active"
        ).count()

        return Response({

            "total_goals": goals.count(),

            "completed": completed,

            "active": active,

            "total_saved": total_saved

        })