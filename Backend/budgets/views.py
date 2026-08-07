from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Budget
from .serializers import BudgetSerializer, BudgetAlertSerializer
from .utils import calculate_budget_utilization
from expenses.models import Expense


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


class BudgetSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("monthly_limit")
        )["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        remaining_budget = total_budget - total_expense
        overspent_amount = abs(remaining_budget) if remaining_budget < 0 else 0

        return Response({
            "budget_amount": total_budget,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "overspent_amount": overspent_amount
        })


class BudgetAlertView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        user_budgets = Budget.objects.filter(
            user=request.user, month=now.month, year=now.year
        )
        alerts_data = []

        for budget in user_budgets:
            _, total_expense, utilization = calculate_budget_utilization(
                request.user, budget.category, budget.month, budget.year
            )

            if utilization < 80:
                continue  # Exclude non-alert states

            if utilization >= 100:
                alert_level = "Exceeded"
                alert_message = f"Your {budget.category} Budget has been exceeded."
            elif utilization >= 90:
                alert_level = "High Warning"
                alert_message = f"You have used 90% of your monthly {budget.category} Budget."
            else:
                alert_level = "Warning"
                alert_message = f"You have used 80% of your monthly {budget.category} Budget."

            alerts_data.append({
                "category": budget.category,
                "budget_amount": budget.monthly_limit,
                "total_expense": total_expense,
                "utilization": round(utilization, 2),
                "alert_level": alert_level,
                "alert_message": alert_message
            })

        serializer = BudgetAlertSerializer(alerts_data, many=True)
        return Response(serializer.data)
