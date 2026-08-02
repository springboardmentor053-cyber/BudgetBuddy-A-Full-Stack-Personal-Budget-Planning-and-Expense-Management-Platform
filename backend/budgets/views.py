from django.db.models import Sum
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Budget
from .serializers import BudgetSerializer
from users.models import Expense


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # This ensures users can only see, update, or delete their own budgets!
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically links the created budget to the logged-in user
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        budget = self.get_object()

        total_expense = Expense.objects.filter(
            user=request.user,
            category__iexact=budget.category,
            expense_date__month=budget.month,
            expense_date__year=budget.year,
        ).aggregate(total=Sum('amount'))['total'] or 0.0

        budget_amount = float(budget.budget_amount)
        total_expense = float(total_expense)
        remaining_budget = max(0.0, budget_amount - total_expense)
        overspent_amount = max(0.0, total_expense - budget_amount)

        return Response({
            'budget_amount': budget_amount,
            'total_expense': total_expense,
            'remaining_budget': remaining_budget,
            'overspent_amount': overspent_amount,
        })
