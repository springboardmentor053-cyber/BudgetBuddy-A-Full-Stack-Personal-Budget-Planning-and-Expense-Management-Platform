from decimal import Decimal
import calendar
from datetime import date

from django.db.models import Sum
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Expense
from income.models import Income
from budgets.models import Budget, SavingsGoal
from notifications.models import Notification


# =====================================================
# DASHBOARD API
# =====================================================

class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # =====================================================
        # CURRENT MONTH
        # =====================================================

        today = date.today()

        current_year = today.year
        current_month_number = today.month

        current_month_name = calendar.month_name[
            current_month_number
        ]

        # =====================================================
        # 1. FINANCIAL SUMMARY
        # =====================================================

        # -----------------------------------------------------
        # ALL-TIME TOTAL INCOME
        # -----------------------------------------------------

        total_income = (
            Income.objects
            .filter(user=user)
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0.00")
        )

        # -----------------------------------------------------
        # ALL-TIME TOTAL EXPENSE
        # -----------------------------------------------------

        total_expense = (
            Expense.objects
            .filter(user=user)
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0.00")
        )

        # -----------------------------------------------------
        # CURRENT BALANCE
        # -----------------------------------------------------

        current_balance = (
            total_income - total_expense
        )

        # -----------------------------------------------------
        # TOTAL SAVINGS
        # -----------------------------------------------------

        total_savings = (
            SavingsGoal.objects
            .filter(user=user)
            .aggregate(total=Sum("saved_amount"))
            .get("total")
            or Decimal("0.00")
        )

        # =====================================================
        # CURRENT MONTH BUDGET
        # =====================================================

        current_month_budgets = (
            Budget.objects
            .filter(
                user=user,
                month__iexact=current_month_name,
            )
        )

        total_budget = (
            current_month_budgets
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0.00")
        )

        # =====================================================
        # CURRENT MONTH EXPENSE
        # =====================================================

        current_month_expense = (
            Expense.objects
            .filter(
                user=user,
                date__year=current_year,
                date__month=current_month_number,
            )
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0.00")
        )

        # -----------------------------------------------------
        # REMAINING CURRENT MONTH BUDGET
        # -----------------------------------------------------

        remaining_budget = (
            total_budget - current_month_expense
        )

        financial_summary = {

            # All-time values
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,

            # Current-month budget values
            "total_budget": total_budget,
            "current_month_expense": current_month_expense,
            "remaining_budget": remaining_budget,
        }

        # =====================================================
        # 2. CATEGORY-WISE EXPENSE ANALYSIS
        # =====================================================

        category_expenses = (
            Expense.objects
            .filter(user=user)
            .values("category")
            .annotate(
                total_amount=Sum("amount")
            )
            .order_by("-total_amount")
        )

        category_analysis = []

        for item in category_expenses:

            category_analysis.append(
                {
                    "category": (
                        item["category"]
                        or "Uncategorized"
                    ),

                    "total_amount": (
                        item["total_amount"]
                        or Decimal("0.00")
                    ),
                }
            )

        # =====================================================
        # 3. MONTHLY EXPENSE TREND
        # =====================================================

        monthly_expenses = (
            Expense.objects
            .filter(user=user)
            .values(
                "date__year",
                "date__month",
            )
            .annotate(
                total_amount=Sum("amount")
            )
            .order_by(
                "date__year",
                "date__month",
            )
        )

        monthly_trend = []

        for item in monthly_expenses:

            month_number = item["date__month"]

            monthly_trend.append(
                {
                    "year": item["date__year"],

                    "month": calendar.month_name[
                        month_number
                    ],

                    "total_amount": (
                        item["total_amount"]
                        or Decimal("0.00")
                    ),
                }
            )

        # =====================================================
        # 4. RECENT TRANSACTIONS
        # =====================================================

        recent_expenses = (
            Expense.objects
            .filter(user=user)
            .order_by(
                "-date",
                "-id",
            )[:5]
        )

        recent_transactions = []

        for expense in recent_expenses:

            recent_transactions.append(
                {
                    "id": expense.id,

                    "title": expense.title,

                    "amount": expense.amount,

                    "category": (
                        expense.category
                        or "Uncategorized"
                    ),

                    "date": expense.date,

                    "type": "expense",
                }
            )

        # =====================================================
        # 5. LATEST NOTIFICATIONS
        # =====================================================

        notifications = (
            Notification.objects
            .filter(
                user=user,
                is_archived=False,
            )
            .order_by("-created_at")[:5]
        )

        latest_notifications = []

        for notification in notifications:

            latest_notifications.append(
                {
                    "id": notification.id,

                    "title": notification.title,

                    "message": notification.message,

                    "notification_type": (
                        notification.notification_type
                    ),

                    "priority": notification.priority,

                    "is_read": notification.is_read,

                    "created_at": (
                        notification.created_at
                    ),
                }
            )

        # =====================================================
        # 6. ACTIVE SAVINGS GOALS
        # =====================================================

        savings_goals = (
            SavingsGoal.objects
            .filter(user=user)
            .order_by("-created_at")
        )

        active_savings_goals = []

        for goal in savings_goals:

            # Ignore completed goals
            if (
                goal.target_amount > 0
                and goal.saved_amount >= goal.target_amount
            ):
                continue

            if goal.target_amount > 0:

                percentage = round(
                    float(
                        (
                            goal.saved_amount
                            / goal.target_amount
                        ) * 100
                    ),
                    2,
                )

            else:

                percentage = 0.0

            active_savings_goals.append(
                {
                    "id": goal.id,

                    "title": goal.title,

                    "target_amount": (
                        goal.target_amount
                    ),

                    "saved_amount": (
                        goal.saved_amount
                    ),

                    "remaining_amount": (
                        goal.target_amount
                        - goal.saved_amount
                    ),

                    "percentage": percentage,

                    "target_date": (
                        goal.target_date
                    ),

                    "description": (
                        goal.description
                    ),
                }
            )

        # =====================================================
        # 7. EXPENSE ANALYSIS
        # =====================================================

        expenses = (
            Expense.objects
            .filter(user=user)
        )

        highest = (
            expenses
            .order_by(
                "-amount",
                "-id",
            )
            .first()
        )

        lowest = (
            expenses
            .order_by(
                "amount",
                "id",
            )
            .first()
        )

        latest = (
            expenses
            .order_by(
                "-date",
                "-id",
            )
            .first()
        )

        oldest = (
            expenses
            .order_by(
                "date",
                "id",
            )
            .first()
        )

        def expense_data(expense):

            if not expense:
                return None

            return {
                "id": expense.id,

                "title": expense.title,

                "amount": expense.amount,

                "category": (
                    expense.category
                    or "Uncategorized"
                ),

                "date": expense.date,
            }

        expense_analysis = {

            "highest_expense":
                expense_data(highest),

            "lowest_expense":
                expense_data(lowest),

            "latest_expense":
                expense_data(latest),

            "oldest_expense":
                expense_data(oldest),
        }

        # =====================================================
        # 8. FINAL DASHBOARD RESPONSE
        # =====================================================

        return Response(
            {
                "financial_summary":
                    financial_summary,

                "category_analysis":
                    category_analysis,

                "monthly_trend":
                    monthly_trend,

                "recent_transactions":
                    recent_transactions,

                "latest_notifications":
                    latest_notifications,

                "active_savings_goals":
                    active_savings_goals,

                "expense_analysis":
                    expense_analysis,
            },

            status=status.HTTP_200_OK,
        )


# =====================================================
# SEPARATE EXPENSE ANALYSIS API
# =====================================================

class ExpenseAnalysisAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        expenses = (
            Expense.objects
            .filter(user=user)
        )

        if not expenses.exists():

            return Response(
                {
                    "highest_expense": None,
                    "lowest_expense": None,
                    "latest_expense": None,
                    "oldest_expense": None,
                },

                status=status.HTTP_200_OK,
            )

        highest = (
            expenses
            .order_by(
                "-amount",
                "-id",
            )
            .first()
        )

        lowest = (
            expenses
            .order_by(
                "amount",
                "id",
            )
            .first()
        )

        latest = (
            expenses
            .order_by(
                "-date",
                "-id",
            )
            .first()
        )

        oldest = (
            expenses
            .order_by(
                "date",
                "id",
            )
            .first()
        )

        def expense_data(expense):

            return {
                "id": expense.id,

                "title": expense.title,

                "amount": expense.amount,

                "category": (
                    expense.category
                    or "Uncategorized"
                ),

                "date": expense.date,
            }

        return Response(
            {
                "highest_expense":
                    expense_data(highest),

                "lowest_expense":
                    expense_data(lowest),

                "latest_expense":
                    expense_data(latest),

                "oldest_expense":
                    expense_data(oldest),
            },

            status=status.HTTP_200_OK,
        )