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
        return Budget.objects.filter(user=self.request.user).order_by('-year', '-month', 'category')

    def perform_create(self, serializer):
        # Automatically links the created budget to the logged-in user
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        budget = self.get_object()
        category_name = budget.category.strip()

        total_expense = Expense.objects.filter(
            user=request.user,
            category__iexact=category_name,
            expense_date__month=int(budget.month),
            expense_date__year=int(budget.year),
        ).aggregate(total=Sum('amount'))['total'] or 0.0

        budget_amount = float(budget.budget_amount)
        total_expense = float(total_expense)
        remaining_budget = max(0.0, budget_amount - total_expense)
        overspent_amount = max(0.0, total_expense - budget_amount)

        return Response({
            'budget_amount': budget_amount,
            'spent': total_expense,
            'remaining': remaining_budget,
            'percentage_used': (total_expense / budget_amount) * 100 if budget_amount > 0 else 0.0,
            # Existing consumers use these field names.
            'total_expense': total_expense,
            'remaining_budget': remaining_budget,
            'overspent_amount': overspent_amount,
        })
