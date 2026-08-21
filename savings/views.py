from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .services import process_recurring_savings_for_user
        process_recurring_savings_for_user(self.request.user)
        return SavingsGoal.objects.filter(user=self.request.user).order_by('target_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavingsGoalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

class SavingsGoalProgressView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        goal = self.get_object()
        remaining_amount = goal.target_amount - goal.saved_amount
        progress_percentage = 0
        if goal.target_amount > 0:
            progress_percentage = (goal.saved_amount / goal.target_amount) * 100

        return Response({
            'goal_name': goal.goal_name,
            'target_amount': float(goal.target_amount),
            'saved_amount': float(goal.saved_amount),
            'remaining_amount': float(remaining_amount),
            'progress_percentage': float(progress_percentage),
            'status': goal.status
        })
