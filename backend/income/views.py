from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Income
from .serializers import IncomeSerializer

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from expenses.models import Expense
        from budgets.models import Budget

        total_income = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        balance = total_income - total_expense

        total_budget = Budget.objects.filter(user=request.user).aggregate(total=Sum('budget_amount'))['total'] or 0
        remaining_budget = total_budget - total_expense

        recent_expenses = list(Expense.objects.filter(user=request.user).order_by('-created_at')[:5].values(
            'id', 'title', 'amount', 'category', 'expense_date'
        ))
        recent_incomes = list(Income.objects.filter(user=request.user).order_by('-created_at')[:5].values(
            'id', 'title', 'amount', 'source', 'income_date'
        ))

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "recent_transactions": {
                "expenses": recent_expenses,
                "incomes": recent_incomes
            }
        })