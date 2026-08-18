from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import TruncMonth
from income.models import Income
from expenses.models import Expense
from savings.models import SavingsGoal
from budgets.models import Budget
from notifications.models import Notification
from django.db.models import Sum


class FinancialSummaryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = (
            Income.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )

        total_savings = (
            SavingsGoal.objects.filter(user=request.user)
            .aggregate(total=Sum("saved_amount"))["total"]
            or Decimal("0")
        )

        total_budget = (
            Budget.objects.filter(user=request.user)
            .aggregate(total=Sum("budget_amount"))["total"]
            or Decimal("0")
        )

        remaining_budget =total_budget - total_expense

        current_balance = total_income - total_expense

        return Response({

            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "current_balance": float(current_balance),
            "total_savings": float(total_savings),
            "total_budget": float(total_budget),
            "remaining_budget": float(remaining_budget),

        })
class CategoryAnalysisAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        category_analysis = (
            Expense.objects.filter(user=request.user)
            .values("category")
            .annotate(amount=Sum("amount"))
            .order_by("-amount")
        )

        return Response(category_analysis)
class MonthlyExpenseTrendAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        monthly = (
            Expense.objects.filter(user=request.user)
            .annotate(month=TruncMonth("expense_date"))
            .values("month")
            .annotate(amount=Sum("amount"))
            .order_by("month")
        )

        data = []

        for item in monthly:
            data.append({
                "month": item["month"].strftime("%b"),
                "amount": float(item["amount"])
            })

        return Response(data)
class ExpenseStatisticsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        expenses = Expense.objects.filter(user=request.user)

        highest = expenses.order_by("-amount").first()
        lowest = expenses.order_by("amount").first()
        latest = expenses.order_by("-expense_date").first()
        oldest = expenses.order_by("expense_date").first()

        def serialize(expense):
            if expense is None:
                return None

            return {
                "id": expense.id,
                "title": expense.title,
                "category": expense.category,
                "amount": float(expense.amount),
                "expense_date": expense.expense_date,
            }

        return Response({
            "highest": serialize(highest),
            "lowest": serialize(lowest),
            "latest": serialize(latest),
            "oldest": serialize(oldest),
        })
class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ---------- Financial Summary ----------

        total_income = (
            Income.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )

        total_savings = (
            SavingsGoal.objects.filter(user=request.user)
            .aggregate(total=Sum("saved_amount"))["total"] or Decimal("0")
        )

        total_budget = (
            Budget.objects.filter(user=request.user)
            .aggregate(total=Sum("budget_amount"))["total"] or Decimal("0")
        )

        summary = {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "current_balance": float(total_income - total_expense),
            "total_savings": float(total_savings),
            "total_budget": float(total_budget),
            "remaining_budget": float(total_budget - total_expense),
        }

        # ---------- Category Analysis ----------

        category_analysis = list(
            Expense.objects.filter(user=request.user)
            .values("category")
            .annotate(amount=Sum("amount"))
            .order_by("-amount")
        )

        # ---------- Monthly Trend ----------

        # ---------- Monthly Trend ----------

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

        monthly_trend = list(data.values())

        # ---------- Recent Transactions ----------

        recent_transactions = list(
            Expense.objects.filter(user=request.user)
            .order_by("-expense_date")[:5]
            .values(
                "id",
                "title",
                "category",
                "amount",
                "expense_date"
            )
        )

        # ---------- Notifications ----------

        notifications = list(
            Notification.objects.filter(user=request.user)
            .order_by("-created_at")[:5]
            .values(
                "id",
                "title",
                "message",
                "is_read",
                "created_at"
            )
        )

        # ---------- Active Savings Goals ----------

        active_savings = list(
            SavingsGoal.objects.filter(user=request.user)
            .values(
                "id",
                "goal_name",
                "target_amount",
                "saved_amount",
                "target_date"
            )
        )

        return Response({

            "summary": summary,

            "category_analysis": category_analysis,

            "monthly_trend": monthly_trend,

            "recent_transactions": recent_transactions,

            "notifications": notifications,

            "active_savings": active_savings,

        })