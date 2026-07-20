from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from expenses.models import Expense
from .models import Budget
from .serializers import BudgetSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):

        category = request.data.get("category")
        month = request.data.get("month")
        year = request.data.get("year")

        if Budget.objects.filter(
            user=request.user,
            category=category,
            month=month,
            year=year,
        ).exists():
            return Response(
                {"error": "Budget already exists for this category and month."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_summary(request, category):

    budget = Budget.objects.filter(
        user=request.user,
        category=category,
    ).first()

    if not budget:
        return Response(
            {"error": "Budget not found"},
            status=404,
        )

    total_expense = (
        Expense.objects.filter(
            user=request.user,
            category=category,
        ).aggregate(total=Sum("amount"))["total"]
        or 0
    )

    remaining_budget = budget.budget_amount - total_expense

    overspent_amount = 0

    if remaining_budget < 0:
        overspent_amount = abs(remaining_budget)

    return Response({
        "category": budget.category,
        "budget_amount": budget.budget_amount,
        "total_expense": total_expense,
        "remaining_budget": remaining_budget,
        "overspent_amount": overspent_amount,
    })