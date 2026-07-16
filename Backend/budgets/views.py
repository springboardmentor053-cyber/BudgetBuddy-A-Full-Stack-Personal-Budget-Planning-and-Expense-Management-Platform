from rest_framework import generics
from .models import Budget, SavingsGoal
from .serializers import (
    BudgetSerializer,
    SavingsGoalSerializer
)


class BudgetListCreateView(generics.ListCreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer


class SavingsGoalListCreateView(generics.ListCreateAPIView):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer


class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer