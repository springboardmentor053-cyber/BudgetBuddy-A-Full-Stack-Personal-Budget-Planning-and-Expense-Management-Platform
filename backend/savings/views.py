# savings/views.py
from rest_framework import generics, permissions
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

# List & Create Savings Goals (Task 4 & Task 5)
class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return goals belonging strictly to the logged-in user
        return SavingsGoal.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Retrieve, Update, & Delete Single Savings Goal (Task 4)
class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)