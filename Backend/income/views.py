from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

from .models import Income
from .serializers import IncomeSerializer
from expenses.models import Expense


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum('amount'))['total'] or 0

        current_balance = total_income - total_expense

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance
        })