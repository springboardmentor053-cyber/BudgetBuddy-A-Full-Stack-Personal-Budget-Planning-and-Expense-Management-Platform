from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Expense, Income
from .serializers import ExpenseSerializer, IncomeSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        sort_by = self.request.query_params.get('sort')
        if sort_by == 'latest':
            queryset = queryset.order_by('-expense_date')
        elif sort_by == 'oldest':
            queryset = queryset.order_by('expense_date')
        elif sort_by == 'highest':
            queryset = queryset.order_by('-amount')
        elif sort_by == 'lowest':
            queryset = queryset.order_by('amount')

        return queryset

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        self._check_budget_alert(expense)

    def perform_update(self, serializer):
        expense = serializer.save()
        self._check_budget_alert(expense)

    def _check_budget_alert(self, expense):
        from budgets.models import Budget
        from budgets.views import check_budget_alerts
        try:
            budget = Budget.objects.get(
                user=self.request.user,
                category=expense.category,
                month=expense.expense_date.month,
                year=expense.expense_date.year
            )
            check_budget_alerts(budget, self.request.user)
        except Budget.DoesNotExist:
            pass


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TotalExpensesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        return Response({"total_expenses": total})