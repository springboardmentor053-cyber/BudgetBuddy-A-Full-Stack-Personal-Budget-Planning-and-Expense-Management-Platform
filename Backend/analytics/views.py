from datetime import date

from django.db.models import Sum
from django.db.models.functions import TruncMonth

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


# ==========================================================
# HELPER FUNCTIONS
# ==========================================================

def get_total_income(user):
    return (
        Income.objects
        .filter(user=user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )


def get_total_expense(user):
    return (
        Expense.objects
        .filter(user=user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )


def get_total_savings(user):
    return (
        SavingsGoal.objects
        .filter(user=user)
        .aggregate(total=Sum("saved_amount"))["total"]
        or 0
    )


# ==========================================================
# 1. FINANCIAL SUMMARY API
# ==========================================================

class FinancialSummaryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        total_income = get_total_income(user)
        total_expense = get_total_expense(user)
        total_savings = get_total_savings(user)

        current_balance = total_income - total_expense

        total_budget = (
            Budget.objects
            .filter(user=user)
            .aggregate(total=Sum("budget_amount"))["total"]
            or 0
        )

        remaining_budget = total_budget - total_expense

        return Response({

            "total_income": total_income,

            "total_expense": total_expense,

            "current_balance": current_balance,

            "total_savings": total_savings,

            "total_budget": total_budget,

            "remaining_budget": remaining_budget,

        })


# ==========================================================
# 2. CATEGORY-WISE EXPENSE ANALYSIS
# ==========================================================

class CategoryExpenseAnalysisAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        category_expenses = (
            Expense.objects
            .filter(user=request.user)
            .values("category")
            .annotate(
                total_spending=Sum("amount")
            )
            .order_by("-total_spending")
        )

        total_expense = get_total_expense(request.user)

        data = []

        for item in category_expenses:

            amount = item["total_spending"] or 0

            percentage = (
                (float(amount) / float(total_expense)) * 100
                if total_expense > 0
                else 0
            )

            data.append({

                "category": item["category"],

                "total_spending": amount,

                "percentage": round(
                    percentage,
                    2
                ),

            })

        return Response(data)


# ==========================================================
# 3. MONTHLY EXPENSE TREND
# ==========================================================

class MonthlyExpenseTrendAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        monthly_expenses = (
            Expense.objects
            .filter(user=request.user)
            .annotate(
                month=TruncMonth("date")
            )
            .values("month")
            .annotate(
                total_expense=Sum("amount")
            )
            .order_by("month")
        )

        data = []

        for item in monthly_expenses:

            data.append({

                "month":
                    item["month"].strftime(
                        "%b %Y"
                    ),

                "total_expense":
                    item["total_expense"] or 0,

            })

        return Response(data)


# ==========================================================
# 4. EXPENSE HIGHLIGHTS
# ==========================================================

class ExpenseHighlightsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        expenses = Expense.objects.filter(
            user=request.user
        )

        highest_expense = (
            expenses
            .order_by("-amount")
            .first()
        )

        lowest_expense = (
            expenses
            .order_by("amount")
            .first()
        )

        latest_expense = (
            expenses
            .order_by("-date", "-id")
            .first()
        )

        oldest_expense = (
            expenses
            .order_by("date", "id")
            .first()
        )

        return Response({

            "highest_expense": (
                {
                    "category":
                        highest_expense.category,

                    "amount":
                        highest_expense.amount,

                    "date":
                        highest_expense.date,

                    "description":
                        highest_expense.description,
                }
                if highest_expense
                else None
            ),

            "lowest_expense": (
                {
                    "category":
                        lowest_expense.category,

                    "amount":
                        lowest_expense.amount,

                    "date":
                        lowest_expense.date,

                    "description":
                        lowest_expense.description,
                }
                if lowest_expense
                else None
            ),

            "latest_expense": (
                {
                    "category":
                        latest_expense.category,

                    "amount":
                        latest_expense.amount,

                    "date":
                        latest_expense.date,

                    "description":
                        latest_expense.description,
                }
                if latest_expense
                else None
            ),

            "oldest_expense": (
                {
                    "category":
                        oldest_expense.category,

                    "amount":
                        oldest_expense.amount,

                    "date":
                        oldest_expense.date,

                    "description":
                        oldest_expense.description,
                }
                if oldest_expense
                else None
            ),

        })


# ==========================================================
# 5. BUDGET STATUS
# ==========================================================

class BudgetStatusAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        budgets = (
            Budget.objects
            .filter(user=user)
            .order_by("year", "month")
        )

        data = []

        for budget in budgets:

            month_number = None

            for number in range(1, 13):

                month_name = date(
                    2000,
                    number,
                    1
                ).strftime("%B")

                if (
                    month_name.lower()
                    == budget.month.lower()
                ):
                    month_number = number
                    break

            if not month_number:
                continue

            total_spent = (
                Expense.objects
                .filter(
                    user=user,
                    category=budget.category,
                    date__month=month_number,
                    date__year=budget.year
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            budget_amount = budget.budget_amount

            if budget_amount > 0:

                utilization = (
                    float(total_spent)
                    / float(budget_amount)
                ) * 100

            else:

                utilization = 0

            remaining = (
                budget_amount - total_spent
            )

            if utilization >= 100:

                status = "EXCEEDED"

            elif utilization >= 90:

                status = "HIGH"

            elif utilization >= 80:

                status = "WARNING"

            else:

                status = "SAFE"

            data.append({

                "id":
                    budget.id,

                "category":
                    budget.category,

                "month":
                    budget.month,

                "year":
                    budget.year,

                "budget_amount":
                    budget_amount,

                "spent_amount":
                    total_spent,

                "remaining_amount":
                    remaining,

                "utilization_percentage":
                    round(
                        utilization,
                        2
                    ),

                "status":
                    status,

            })

        return Response(data)


# ==========================================================
# 6. SAVINGS GOAL PROGRESS
# ==========================================================

class SavingsGoalProgressAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        goals = SavingsGoal.objects.filter(
            user=request.user
        )

        data = []

        for goal in goals:

            target = goal.target_amount
            saved = goal.saved_amount

            if target and target > 0:

                progress = (
                    float(saved)
                    / float(target)
                ) * 100

            else:

                progress = 0

            progress = min(
                round(progress, 2),
                100
            )

            data.append({

                "id":
                    goal.id,

                "goal_name":
                    goal.goal_name,

                "target_amount":
                    target,

                "saved_amount":
                    saved,

                "remaining_amount":
                    goal.remaining_amount,

                "progress_percentage":
                    progress,

                "status":
                    goal.status,

            })

        return Response(data)


# ==========================================================
# 7. RECENT TRANSACTIONS
# ==========================================================

class RecentTransactionsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        recent_expenses = (
            Expense.objects
            .filter(user=request.user)
            .order_by("-date", "-id")[:10]
        )

        data = []

        for expense in recent_expenses:

            data.append({

                "id":
                    expense.id,

                "type":
                    "EXPENSE",

                "category":
                    expense.category,

                "amount":
                    expense.amount,

                "date":
                    expense.date,

                "description":
                    expense.description,

            })

        return Response(data)


# ==========================================================
# 8. NOTIFICATIONS / ALERTS
# ==========================================================

class AnalyticsNotificationsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = (
            Notification.objects
            .filter(user=request.user)
            .order_by("-created_at")[:10]
        )

        data = []

        for notification in notifications:

            data.append({

                "id":
                    notification.id,

                "title":
                    notification.title,

                "message":
                    notification.message,

                "notification_type":
                    notification.notification_type,

                "priority":
                    notification.priority,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at,

            })

        return Response(data)


# ==========================================================
# 9. COMPLETE ANALYTICS DASHBOARD API
# ==========================================================

class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # ==================================================
        # FINANCIAL SUMMARY
        # ==================================================

        total_income = get_total_income(user)

        total_expense = get_total_expense(user)

        total_savings = get_total_savings(user)

        current_balance = (
            total_income
            - total_expense
        )

        total_budget = (
            Budget.objects
            .filter(user=user)
            .aggregate(
                total=Sum("budget_amount")
            )["total"]
            or 0
        )

        remaining_budget = (
            total_budget
            - total_expense
        )


        # ==================================================
        # CATEGORY ANALYSIS
        # ==================================================

        category_queryset = (
            Expense.objects
            .filter(user=user)
            .values("category")
            .annotate(
                total_spending=Sum("amount")
            )
            .order_by("-total_spending")
        )

        category_analysis = []

        for item in category_queryset:

            amount = (
                item["total_spending"]
                or 0
            )

            percentage = (
                (
                    float(amount)
                    / float(total_expense)
                ) * 100
                if total_expense > 0
                else 0
            )

            category_analysis.append({

                "category":
                    item["category"],

                "total_spending":
                    amount,

                "percentage":
                    round(
                        percentage,
                        2
                    ),

            })


        # ==================================================
        # TOP SPENDING CATEGORY
        # ==================================================

        if category_analysis:

            top_category = category_analysis[0]

        else:

            top_category = None


        # ==================================================
        # MONTHLY EXPENSE TREND
        # ==================================================

        monthly_expenses = (
            Expense.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth("date")
            )
            .values("month")
            .annotate(
                total_expense=Sum("amount")
            )
            .order_by("month")
        )

        monthly_trend = []

        for item in monthly_expenses:

            monthly_trend.append({

                "month":
                    item["month"].strftime(
                        "%b %Y"
                    ),

                "total_expense":
                    item["total_expense"]
                    or 0,

            })


        # ==================================================
        # RECENT TRANSACTIONS
        # ==================================================

        recent_expenses = (
            Expense.objects
            .filter(user=user)
            .order_by(
                "-date",
                "-id"
            )[:5]
        )

        recent_transactions = []

        for expense in recent_expenses:

            recent_transactions.append({

                "id":
                    expense.id,

                "type":
                    "EXPENSE",

                "category":
                    expense.category,

                "amount":
                    expense.amount,

                "date":
                    expense.date,

                "description":
                    expense.description,

            })


        # ==================================================
        # NOTIFICATIONS
        # ==================================================

        latest_notifications = (
            Notification.objects
            .filter(user=user)
            .order_by(
                "-created_at"
            )[:5]
        )

        notifications = []

        for notification in latest_notifications:

            notifications.append({

                "id":
                    notification.id,

                "title":
                    notification.title,

                "message":
                    notification.message,

                "priority":
                    notification.priority,

                "notification_type":
                    notification.notification_type,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at,

            })


        # ==================================================
        # SAVINGS GOALS
        # ==================================================

        goals = SavingsGoal.objects.filter(
            user=user
        )

        savings_goals = []

        active_goals = 0
        completed_goals = 0

        for goal in goals:

            target = goal.target_amount

            saved = goal.saved_amount

            if target and target > 0:

                progress = (
                    float(saved)
                    / float(target)
                ) * 100

            else:

                progress = 0

            progress = min(
                round(progress, 2),
                100
            )

            if goal.status == "ACTIVE":

                active_goals += 1

            elif goal.status == "COMPLETED":

                completed_goals += 1

            savings_goals.append({

                "id":
                    goal.id,

                "goal_name":
                    goal.goal_name,

                "target_amount":
                    target,

                "saved_amount":
                    saved,

                "remaining_amount":
                    goal.remaining_amount,

                "progress_percentage":
                    progress,

                "status":
                    goal.status,

            })


        # ==================================================
        # BUDGET STATUS
        # ==================================================

        budgets = (
            Budget.objects
            .filter(user=user)
            .order_by(
                "year",
                "month"
            )
        )

        budget_status = []

        total_budget_used = 0

        for budget in budgets:

            month_number = None

            for number in range(1, 13):

                month_name = date(
                    2000,
                    number,
                    1
                ).strftime("%B")

                if (
                    month_name.lower()
                    == budget.month.lower()
                ):

                    month_number = number
                    break

            if not month_number:
                continue

            spent = (
                Expense.objects
                .filter(
                    user=user,
                    category=budget.category,
                    date__month=month_number,
                    date__year=budget.year
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            budget_amount = (
                budget.budget_amount
            )

            if budget_amount > 0:

                utilization = (
                    float(spent)
                    / float(budget_amount)
                ) * 100

            else:

                utilization = 0

            if utilization >= 100:

                status = "EXCEEDED"

            elif utilization >= 90:

                status = "HIGH"

            elif utilization >= 80:

                status = "WARNING"

            else:

                status = "SAFE"

            total_budget_used += float(
                spent
            )

            budget_status.append({

                "id":
                    budget.id,

                "category":
                    budget.category,

                "month":
                    budget.month,

                "year":
                    budget.year,

                "budget_amount":
                    budget_amount,

                "spent_amount":
                    spent,

                "remaining_amount":
                    budget_amount - spent,

                "utilization_percentage":
                    round(
                        utilization,
                        2
                    ),

                "status":
                    status,

            })


        # ==================================================
        # BUDGET UTILIZATION OVERALL
        # ==================================================

        overall_budget_utilization = (

            (
                float(total_expense)
                / float(total_budget)
            ) * 100

            if total_budget > 0

            else 0

        )

        overall_budget_utilization = round(
            overall_budget_utilization,
            2
        )


        # ==================================================
        # EXPENSE HIGHLIGHTS
        # ==================================================

        highest_expense = (
            Expense.objects
            .filter(user=user)
            .order_by("-amount")
            .first()
        )

        latest_expense = (
            Expense.objects
            .filter(user=user)
            .order_by(
                "-date",
                "-id"
            )
            .first()
        )

        expense_highlights = {

            "highest_expense": (
                {
                    "category":
                        highest_expense.category,

                    "amount":
                        highest_expense.amount,

                    "date":
                        highest_expense.date,

                    "description":
                        highest_expense.description,
                }
                if highest_expense
                else None
            ),

            "latest_expense": (
                {
                    "category":
                        latest_expense.category,

                    "amount":
                        latest_expense.amount,

                    "date":
                        latest_expense.date,

                    "description":
                        latest_expense.description,
                }
                if latest_expense
                else None
            ),

        }


        # ==================================================
        # FINAL RESPONSE
        # ==================================================

        return Response({

            # ----------------------------------------------
            # FINANCIAL SUMMARY
            # ----------------------------------------------

            "financial_summary": {

                "total_income":
                    total_income,

                "total_expense":
                    total_expense,

                "current_balance":
                    current_balance,

                "total_savings":
                    total_savings,

                "total_budget":
                    total_budget,

                "remaining_budget":
                    remaining_budget,

                "overall_budget_utilization":
                    overall_budget_utilization,

            },


            # ----------------------------------------------
            # EXPENSE ANALYSIS
            # ----------------------------------------------

            "category_analysis":
                category_analysis,

            "top_category":
                top_category,


            # ----------------------------------------------
            # MONTHLY TREND
            # ----------------------------------------------

            "monthly_trend":
                monthly_trend,


            # ----------------------------------------------
            # BUDGETS
            # ----------------------------------------------

            "budget_status":
                budget_status,


            # ----------------------------------------------
            # TRANSACTIONS
            # ----------------------------------------------

            "recent_transactions":
                recent_transactions,


            # ----------------------------------------------
            # SAVINGS
            # ----------------------------------------------

            "savings_goals":
                savings_goals,

            "savings_summary": {

                "active_goals":
                    active_goals,

                "completed_goals":
                    completed_goals,

                "total_goals":
                    len(savings_goals),

            },


            # ----------------------------------------------
            # NOTIFICATIONS
            # ----------------------------------------------

            "notifications":
                notifications,


            # ----------------------------------------------
            # EXPENSE HIGHLIGHTS
            # ----------------------------------------------

            "expense_highlights":
                expense_highlights,

        })