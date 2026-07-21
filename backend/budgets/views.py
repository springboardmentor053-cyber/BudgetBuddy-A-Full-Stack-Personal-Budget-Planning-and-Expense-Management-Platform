from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget, SavingsGoal
from .serializers import BudgetSerializer, SavingsGoalSerializer
from expenses.models import Expense

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user)
        summary = []
        for budget in budgets:
            total_expense = Expense.objects.filter(
                user=request.user,
                category=budget.category,
                expense_date__month=budget.month,
                expense_date__year=budget.year
            ).aggregate(total=Sum('amount'))['total'] or 0

            remaining = budget.budget_amount - total_expense
            overspent = abs(remaining) if remaining < 0 else 0

            summary.append({
                "category": budget.category,
                "month": budget.month,
                "year": budget.year,
                "budget_amount": budget.budget_amount,
                "total_expense": total_expense,
                "remaining_budget": remaining if remaining >= 0 else 0,
                "overspent_amount": overspent
            })
        return Response(summary)