from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal


class FinancialAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(total=Sum("monthly_limit"))["total"] or 0

        total_saved = SavingsGoal.objects.filter(
            user=request.user
        ).aggregate(total=Sum("saved_amount"))["total"] or 0

        total_goals = SavingsGoal.objects.filter(
            user=request.user
        ).count()

        current_balance = total_income - total_expense

        remaining_budget = total_budget - total_expense

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "total_saved": total_saved,
            "total_savings_goals": total_goals,
        })


class BudgetAlertAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        budgets = Budget.objects.filter(user=request.user)

        alerts = []

        for budget in budgets:

            total_expense = Expense.objects.filter(
                user=request.user,
                category=budget.category
            ).aggregate(total=Sum("amount"))["total"] or 0

            percentage = (
                (total_expense / budget.monthly_limit) * 100
                if budget.monthly_limit > 0 else 0
            )

            if percentage >= 100:
                message = "Budget Exceeded"
            elif percentage >= 90:
                message = "Budget Almost Full"
            elif percentage >= 80:
                message = "Budget Warning"
            else:
                continue

            alerts.append({
                "category": budget.category,
                "budget_limit": budget.monthly_limit,
                "spent": total_expense,
                "usage_percentage": round(percentage, 2),
                "alert": message,
            })

        return Response(alerts)


class FinancialReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(total=Sum("monthly_limit"))["total"] or 0

        total_saved = SavingsGoal.objects.filter(
            user=request.user
        ).aggregate(total=Sum("saved_amount"))["total"] or 0

        remaining_budget = total_budget - total_expense
        current_balance = total_income - total_expense

        if total_expense > total_budget:
            budget_status = "Overspent"
        elif total_expense >= (total_budget * 0.8):
            budget_status = "Near Budget Limit"
        else:
            budget_status = "Within Budget"

        return Response({
            "report": {
                "total_income": total_income,
                "total_expense": total_expense,
                "current_balance": current_balance,
                "total_budget": total_budget,
                "remaining_budget": remaining_budget,
                "total_saved": total_saved,
                "budget_status": budget_status,
            }
        })
