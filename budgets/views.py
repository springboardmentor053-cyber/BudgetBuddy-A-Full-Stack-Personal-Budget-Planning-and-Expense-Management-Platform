from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense


class BudgetListCreateView(generics.ListCreateAPIView):

    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):

        category = serializer.validated_data["category"]
        month = serializer.validated_data["month"]
        year = serializer.validated_data["year"]

        if Budget.objects.filter(
            user=self.request.user,
            category=category,
            month=month,
            year=year
        ).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                "Budget already exists for this category and month."
            )

        serializer.save(user=self.request.user)


class BudgetRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        category = request.query_params.get("category")

        budget = Budget.objects.filter(
            user=request.user,
            category=category
        ).first()

        if not budget:
            return Response({
                "message": "No budget found."
            })

        total_expense = (
            Expense.objects.filter(
                user=request.user,
                category=category
            ).aggregate(total=Sum("amount"))["total"] or 0
        )

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