from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Income
from .serializers import IncomeSerializer
from expenses.models import Expense
from budgets.models import Budget


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def financial_summary(request):

    total_income = (
        Income.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    total_expense = (
        Expense.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    balance = total_income - total_expense

    return Response({
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transaction_dashboard(request):

    total_income = (
        Income.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    total_expense = (
        Expense.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    total_budget = (
        Budget.objects.filter(user=request.user)
        .aggregate(total=Sum("budget_amount"))["total"] or 0
    )

    current_balance = total_income - total_expense
    remaining_budget = total_budget - total_expense

    recent_income = list(
    Income.objects.filter(user=request.user)
    .order_by("-id")[:5]
    .values(
        "id",
        "source",
        "amount",
        "income_date"
    )
)

    recent_expenses = list(
        Expense.objects.filter(user=request.user)
        .order_by("-id")[:5]
        .values(
            "id",
            "title",
            "amount",
            "category",
            "date"
        )
    )

    return Response({
        "total_income": total_income,
        "total_expense": total_expense,
        "current_balance": current_balance,
        "total_budget": total_budget,
        "remaining_budget": remaining_budget,
        "recent_income": recent_income,
        "recent_transactions": recent_expenses
    })