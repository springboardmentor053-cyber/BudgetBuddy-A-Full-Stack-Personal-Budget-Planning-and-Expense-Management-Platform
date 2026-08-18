from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from datetime import date
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
class BudgetAlertAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        budgets = Budget.objects.filter(user=request.user)

        result = []

        for budget in budgets:

            total_expense = (
                Expense.objects.filter(
                    user=request.user,
                    category=budget.category,
                    expense_date__month=1 if False else None
                )
            )

            total_expense = (
                Expense.objects.filter(
                    user=request.user,
                    category=budget.category,
                    expense_date__month=date.today().month,
                    expense_date__year=date.today().year,
                ).aggregate(total=Sum("amount"))["total"]
                or 0
            )

            utilization = (
                total_expense / budget.budget_amount
            ) * 100 if budget.budget_amount else 0

            if utilization >= 100:
                level = "Exceeded"
                message = f"Your {budget.category.title()} Budget has been exceeded."

            elif utilization >= 90:
                level = "High Warning"
                message = f"You have used 90% of your {budget.category.title()} Budget."

            elif utilization >= 80:
                level = "Warning"
                message = f"You have used 80% of your {budget.category.title()} Budget."

            else:
                level = "Safe"
                message = "Budget is within limit."

            result.append({

                "category": budget.category,

                "budget_amount": budget.budget_amount,

                "total_expense": total_expense,

                "budget_utilization": round(utilization, 2),

                "alert_level": level,

                "alert_message": message,

            })

        return Response(result)