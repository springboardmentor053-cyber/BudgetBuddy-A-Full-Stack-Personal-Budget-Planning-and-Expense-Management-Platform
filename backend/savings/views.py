from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer
from notifications.models import Notification

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            title='Savings Goal Created',
            message=f'Your savings goal "{goal.goal_name}" has been created.',
            notification_type='savings_goal',
            priority='medium'
        )

    def perform_update(self, serializer):
        goal = serializer.save()
        if goal.status == 'completed':
            Notification.objects.create(
                user=self.request.user,
                title='Savings Goal Completed',
                message=f'Congratulations! You completed your savings goal "{goal.goal_name}".',
                notification_type='savings_goal',
                priority='high'
            )


class SavingsGoalProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        goals = SavingsGoal.objects.filter(user=request.user)
        result = []
        for goal in goals:
            remaining = goal.target_amount - goal.saved_amount
            progress = (goal.saved_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
            result.append({
                "goal_name": goal.goal_name,
                "target_amount": goal.target_amount,
                "saved_amount": goal.saved_amount,
                "remaining_amount": remaining,
                "progress_percentage": round(progress, 2),
                "status": goal.status
            })
        return Response(result)
