from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer


class SavingsGoalListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavingsGoalDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)


class GoalProgressAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        goals = SavingsGoal.objects.filter(user=request.user)

        data = []

        for goal in goals:

            remaining_amount = goal.target_amount - goal.saved_amount

            progress_percentage = (
                (goal.saved_amount / goal.target_amount) * 100
                if goal.target_amount > 0 else 0
            )

            data.append({
                "goal_name": goal.goal_name,
                "goal_type": goal.goal_type,
                "target_amount": goal.target_amount,
                "saved_amount": goal.saved_amount,
                "remaining_amount": remaining_amount,
                "progress_percentage": round(progress_percentage, 2),
                "status": goal.status,
                "target_date": goal.target_date,
            })

        return Response(data)
