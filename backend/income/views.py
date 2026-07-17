from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Income
from .serializers import IncomeSerializer

# Import your existing Expense model from your expenses app
from expenses.models import Expense 

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Changed .order_set to .order_by
        return Income.objects.filter(user=self.request.user).order_by('-income_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Aggregate total calculations safely
        total_income_query = Income.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_expense_query = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))

        total_income = float(total_income_query['total'] or 0.0)
        total_expense = float(total_expense_query['total'] or 0.0)
        current_balance = total_income - total_expense

        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'current_balance': current_balance
        })