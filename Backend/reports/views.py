from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import timedelta
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


# ==========================================================
# Monthly Financial Report API
# ==========================================================

class MonthlyFinancialReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        month = request.GET.get("month")
        year = request.GET.get("year")

        if not month or not year:
            return Response(
                {
                    "error": "Please provide month and year."
                },
                status=400
            )

        total_income = Income.objects.filter(
            user=request.user,
            income_date__month=month,
            income_date__year=year
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user,
            date__month=month,
            date__year=year
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_savings = SavingsGoal.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("saved_amount")
        )["total"] or 0

        total_budget = Budget.objects.filter(
            user=request.user,
            month="August",
            year=year
        ).aggregate(
            total=Sum("budget_amount")
        )["total"] or 0

        current_balance = total_income - total_expense

        remaining_budget = total_budget - total_expense

        return Response({

            "month": month,
            "year": year,

            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "remaining_budget": remaining_budget

        })


# ==========================================================
# Expense Report API
# ==========================================================

class ExpenseReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        filter_type = request.GET.get("filter")

        today = timezone.now().date()

        if filter_type == "current_month":

            start_date = today.replace(day=1)
            end_date = today

        elif filter_type == "previous_month":

            first_day_current_month = today.replace(day=1)

            end_date = first_day_current_month - timedelta(days=1)

            start_date = end_date.replace(day=1)

        else:

            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")

            if not start_date or not end_date:
                return Response(
                    {
                        "error": (
                            "Provide either filter=current_month, "
                            "filter=previous_month OR "
                            "start_date & end_date."
                        )
                    },
                    status=400
                )

        expenses = Expense.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        ).order_by("date")

        report = []

        for expense in expenses:

            report.append({

                "expense_title": expense.category,
                "category": expense.category,
                "amount": expense.amount,
                "date": expense.date,
                "description": expense.description

            })

        return Response({

            "report_name": "Expense Report",

            "start_date": str(start_date),

            "end_date": str(end_date),

            "total_records": len(report),

            "data": report

        })


# ==========================================================
# Savings Report API
# ==========================================================

class SavingsReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        savings_goals = SavingsGoal.objects.filter(
            user=request.user
        ).order_by("goal_name")

        report = []

        for goal in savings_goals:

            report.append({

                "goal_name": goal.goal_name,
                "target_amount": goal.target_amount,
                "saved_amount": goal.saved_amount,
                "remaining_amount": goal.remaining_amount,
                "progress_percentage": goal.progress_percentage,
                "status": goal.status

            })

        return Response(report)


# ==========================================================
# Financial Summary Report API
# ==========================================================

class FinancialSummaryReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ==========================================
        # FINANCIAL SUMMARY
        # ==========================================

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

        total_savings = SavingsGoal.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("saved_amount")
        )["total"] or 0

        total_budget = Budget.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("budget_amount")
        )["total"] or 0

        current_balance = total_income - total_expense

        remaining_budget = total_budget - total_expense


        # ==========================================
        # MONTHLY EXPENSE HISTORY
        # ==========================================

        monthly_expenses = Expense.objects.filter(
            user=request.user
        ).annotate(
            expense_month=TruncMonth("date")
        ).values(
            "expense_month"
        ).annotate(
            total_amount=Sum("amount")
        ).order_by(
            "expense_month"
        )

        monthly_expense_history = []

        for item in monthly_expenses:

            monthly_expense_history.append({

                "month": item["expense_month"].strftime(
                    "%b %Y"
                ),

                "total_expense": item["total_amount"]

            })


        # ==========================================
        # HIGHEST EXPENSE MONTH
        # ==========================================

        highest_expense_month = None

        highest_expense_amount = 0

        if monthly_expense_history:

            highest_month = max(
                monthly_expense_history,
                key=lambda item: item["total_expense"]
            )

            highest_expense_month = (
                highest_month["month"]
            )

            highest_expense_amount = (
                highest_month["total_expense"]
            )


        # ==========================================
        # EXPENSE SUMMARY
        # ==========================================

        expense_summary = Expense.objects.filter(
            user=request.user
        ).values(
            "category"
        ).annotate(
            total_amount=Sum("amount")
        ).order_by("category")


        # ==========================================
        # INCOME SUMMARY
        # ==========================================

        income_summary = Income.objects.filter(
            user=request.user
        ).values(
            "title"
        ).annotate(
            total_amount=Sum("amount")
        ).order_by("title")


        # ==========================================
        # BUDGET SUMMARY
        # ==========================================

        budget_summary = Budget.objects.filter(
            user=request.user
        ).values(
            "category",
            "budget_amount",
            "month",
            "year"
        ).order_by("category")


        # ==========================================
        # SAVINGS SUMMARY
        # ==========================================

        savings_summary = SavingsGoal.objects.filter(
            user=request.user
        ).values(
            "goal_name",
            "target_amount",
            "saved_amount",
            "status"
        ).order_by("goal_name")


        # ==========================================
        # LATEST NOTIFICATIONS
        # ==========================================

        latest_notifications = Notification.objects.filter(
            user=request.user
        ).values(
            "title",
            "message",
            "priority",
            "notification_type",
            "created_at"
        ).order_by(
            "-created_at"
        )[:5]


        # ==========================================
        # RESPONSE
        # ==========================================

        return Response({

            "financial_summary": {

                "total_income":
                    total_income,

                "total_expense":
                    total_expense,

                "current_balance":
                    current_balance,

                "total_savings":
                    total_savings,

                "remaining_budget":
                    remaining_budget,

                "highest_expense_month":
                    highest_expense_month,

                "highest_expense_amount":
                    highest_expense_amount,

                "monthly_expense_history":
                    monthly_expense_history

            },

            "expense_summary":
                expense_summary,

            "income_summary":
                income_summary,

            "budget_summary":
                budget_summary,

            "savings_summary":
                savings_summary,

            "latest_notifications":
                latest_notifications

        })