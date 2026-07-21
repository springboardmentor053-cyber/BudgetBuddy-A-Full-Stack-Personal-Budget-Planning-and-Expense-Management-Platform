from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        # Total Budget Amount
        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(total=Sum('budget_amount'))['total'] or 0

        # Total Expense
        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Remaining Budget
        remaining_budget = total_budget - total_expense

        # Overspent Amount
        if remaining_budget < 0:
            overspent_amount = abs(remaining_budget)
        else:
            overspent_amount = 0

        return Response({
            "budget_amount": total_budget,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "overspent_amount": overspent_amount
        })