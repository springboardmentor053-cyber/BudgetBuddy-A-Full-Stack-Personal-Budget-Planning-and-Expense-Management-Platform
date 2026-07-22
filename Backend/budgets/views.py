
from rest_framework import generics, permissions
from .models import Budget
from .serializers import BudgetSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

from expenses.models import Expense


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("monthly_limit")
        )["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        remaining_budget = total_budget - total_expense

        overspent_amount = 0
        if remaining_budget < 0:
            overspent_amount = abs(remaining_budget)

        return Response({
            "budget_amount": total_budget,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "overspent_amount": overspent_amount
        })
