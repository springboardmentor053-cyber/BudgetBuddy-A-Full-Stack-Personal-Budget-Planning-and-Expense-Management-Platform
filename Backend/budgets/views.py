from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from expenses.models import Expense
from django.db.models import Sum
from income.models import Income
from rest_framework.permissions import IsAuthenticated

from .models import Budget, SavingsGoal
from .serializers import (
    BudgetSerializer,
    SavingsGoalSerializer
)


class BudgetListCreateView(generics.ListCreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer


class SavingsGoalListCreateView(generics.ListCreateAPIView):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer


class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer


class BudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        budget = Budget.objects.get(pk=pk)

        total_expense = Expense.objects.filter(
            user=request.user,
            category=budget.category
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        remaining_budget = budget.budget_amount - total_expense

        overspent_amount = 0

        if remaining_budget < 0:
            overspent_amount = abs(remaining_budget)
            remaining_budget = 0

        return Response({
            "budget_amount": budget.budget_amount,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "overspent_amount": overspent_amount
        })
    

class TransactionDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("budget_amount")
        )["total"] or 0

        current_balance = total_income - total_expense

        remaining_budget = total_budget - total_expense

        recent_expenses = list(
            Expense.objects.filter(
                user=request.user
            ).values(
                "title",
                "amount"
            )[:5]
        )

        return Response({

            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "recent_transactions": recent_expenses

        })