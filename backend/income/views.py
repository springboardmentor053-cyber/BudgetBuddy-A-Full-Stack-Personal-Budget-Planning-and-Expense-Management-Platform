from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Income
from .serializers import IncomeSerializer
from expenses.models import Expense  # Used for financial summary formula

# Task 3 & Task 6: CRUD APIs protected by JWT Authentication
class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Task 5: Summary API returning Total Income, Total Expense, Current Balance
class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Calculate Total Income for logged-in user
        total_income_aggregate = Income.objects.filter(user=request.user).aggregate(Sum('amount'))
        total_income = total_income_aggregate['amount__sum'] or 0.00

        # Calculate Total Expense for logged-in user
        total_expense_aggregate = Expense.objects.filter(user=request.user).aggregate(Sum('amount'))
        total_expense = total_expense_aggregate['amount__sum'] or 0.00

        # Formula: Balance = Total Income - Total Expense
        current_balance = float(total_income) - float(total_expense)

        return Response({
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "current_balance": float(current_balance)
        })