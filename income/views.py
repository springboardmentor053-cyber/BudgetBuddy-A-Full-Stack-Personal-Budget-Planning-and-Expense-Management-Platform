from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Income
from .serializers import IncomeSerializer
from expenses.models import Expense
from budgets.models import Budget
from expenses.models import Expense
from django.db.models.functions import TruncMonth

class IncomeListCreateView(generics.ListCreateAPIView):

    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
class TotalIncomeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = (
            Income.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        return Response({
            "total_income": total_income
        })
class FinancialSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = (
            Income.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        current_balance = total_income - total_expense

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance
        })
class TransactionDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

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

        remaining_budget = max(
    Decimal("0"),
    total_budget - total_expense
)

        income_transactions = Income.objects.filter(
            user=request.user
        ).values(
            "title",
            "amount",
            "income_date"
        )

        expense_transactions = Expense.objects.filter(
            user=request.user
        ).values(
            "title",
            "amount",
            "expense_date"
        )

        recent_transactions = []

        for income in income_transactions:
            recent_transactions.append({
                "type": "Income",
                "title": income["title"],
                "amount": income["amount"],
                "date": income["income_date"],
            })

        for expense in expense_transactions:
            recent_transactions.append({
                "type": "Expense",
                "title": expense["title"],
                "amount": expense["amount"],
                "date": expense["expense_date"],
            })

        recent_transactions = sorted(
            recent_transactions,
            key=lambda x: x["date"],
            reverse=True
        )

        return Response({

            "total_income": total_income,

            "total_expense": total_expense,

            "current_balance": current_balance,

            "total_budget": total_budget,

            "remaining_budget": float(remaining_budget),

            "recent_transactions": recent_transactions[:10]

        })
class MonthlyComparisonAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        income = (
            Income.objects.filter(user=request.user)
            .annotate(month=TruncMonth("income_date"))
            .values("month")
            .annotate(total=Sum("amount"))
        )

        expense = (
            Expense.objects.filter(user=request.user)
            .annotate(month=TruncMonth("expense_date"))
            .values("month")
            .annotate(total=Sum("amount"))
        )

        data = {}

        for item in income:
            month = item["month"].strftime("%b")
            data[month] = {
                "month": month,
                "income": float(item["total"]),
                "expense": 0,
            }

        for item in expense:
            month = item["month"].strftime("%b")

            if month not in data:
                data[month] = {
                    "month": month,
                    "income": 0,
                    "expense": float(item["total"]),
                }
            else:
                data[month]["expense"] = float(item["total"])

        return Response(list(data.values()))