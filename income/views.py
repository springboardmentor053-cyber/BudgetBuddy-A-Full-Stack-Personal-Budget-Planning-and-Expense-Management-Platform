from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Income
from .serializers import IncomeSerializer
from expenses.models import Expense
from django.db.models import Sum

class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-income_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IncomeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

class IncomeExpenseSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Calculate Total Income for the authenticated user
        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate Total Expense for the authenticated user
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # Current Balance calculation
        current_balance = total_income - total_expense
        
        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'current_balance': float(current_balance)
        }, status=200)
