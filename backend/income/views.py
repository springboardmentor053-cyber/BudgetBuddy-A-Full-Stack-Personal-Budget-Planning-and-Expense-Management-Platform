from rest_framework import viewsets, permissions
from .models import Income
from .serializers import IncomeSerializer

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from expenses.models import Expense

class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_income = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        balance = total_income - total_expense
        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": balance
        })