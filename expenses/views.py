from django.db.models import Sum
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from decimal import Decimal
from budgets.models import Budget
from notifications.budget_utils import (
    budget_warning,
    budget_high_warning,
    budget_exceeded,
)
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        # Filter by category
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(category=category)

        # Sort expenses
        sort = self.request.query_params.get("sort")

        if sort == "latest":
            queryset = queryset.order_by("-expense_date")

        elif sort == "oldest":
            queryset = queryset.order_by("expense_date")

        elif sort == "highest":
            queryset = queryset.order_by("-amount")

        elif sort == "lowest":
            queryset = queryset.order_by("amount")

        return queryset

    def perform_create(self, serializer):
        print("🔥 perform_create() CALLED")

        expense = serializer.save(user=self.request.user)

        budget = Budget.objects.filter(
            user=self.request.user,
            category=expense.category,
            month=expense.expense_date.strftime("%B").lower(),
            year=expense.expense_date.year,
        ).first()
        print("Expense category:", expense.category)
        print("Expense month:", expense.expense_date.strftime("%B").lower())        
        if not budget:
            return

        total_expense = (
            Expense.objects.filter(
                user=self.request.user,
                category=expense.category,
                expense_date__month=expense.expense_date.month,
                expense_date__year=expense.expense_date.year,
            ).aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )
        print("Total expense:", total_expense)

        utilization = (
            total_expense / budget.budget_amount
        ) * 100

        # ---------- 80% ----------
        if (
            utilization >= 80
            and utilization < 90
            and not budget.alert_80_sent
        ):
            print("80% ALERT TRIGGERED")

            budget_warning(budget)

            budget.alert_80_sent = True

            budget.save()

        # ---------- 90% ----------
        elif (
            utilization >= 90
            and utilization < 100
            and not budget.alert_90_sent
        ):
            print("90% ALERT TRIGGERED")

            budget_high_warning(budget)

            budget.alert_90_sent = True

            budget.save()

        # ---------- 100% ----------
        elif (
            utilization >= 100
            and not budget.alert_100_sent
        ):
            print("100% ALERT TRIGGERED")

            budget_exceeded(budget)

            budget.alert_100_sent = True

            budget.save()
        print("Utilization:", utilization)
        print("80 sent:", budget.alert_80_sent)
        print("90 sent:", budget.alert_90_sent)
        print("100 sent:", budget.alert_100_sent)
                 
class ExpenseRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


class TotalExpenseView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        return Response({
            "total_expense": total_expense
        })
class ExpenseChartView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        chart_data = (
            Expense.objects
            .filter(user=request.user)
            .values("category")
            .annotate(value=Sum("amount"))
            .order_by("category")
        )

        data = [
            {
                "name": item["category"],
                "value": float(item["value"])
            }
            for item in chart_data
        ]

        return Response(data)