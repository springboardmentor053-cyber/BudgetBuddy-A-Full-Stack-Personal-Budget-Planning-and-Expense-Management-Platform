from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal


# =========================================================
# FINANCIAL SUMMARY API
# =========================================================

class FinancialSummaryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # -------------------------------------------------
        # TOTAL INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # TOTAL EXPENSE
        # -------------------------------------------------

        total_expense = (
            Expense.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # CURRENT BALANCE
        # -------------------------------------------------

        current_balance = (
            total_income -
            total_expense
        )

        # -------------------------------------------------
        # TOTAL SAVINGS
        # -------------------------------------------------

        total_savings = (
            SavingsGoal.objects
            .filter(user=user)
            .aggregate(
                total=Sum("saved_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # TOTAL BUDGET
        # -------------------------------------------------

        total_budget = (
            Budget.objects
            .filter(user=user)
            .aggregate(
                total=Sum("budget_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # REMAINING BUDGET
        # -------------------------------------------------

        remaining_budget = (
            total_budget -
            total_expense
        )

        return Response({

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

        })


# =========================================================
# CATEGORY-WISE EXPENSE ANALYSIS
# =========================================================

class CategoryExpenseAnalysisView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        category_expenses = list(

            Expense.objects
            .filter(user=user)
            .values("category")
            .annotate(
                total_expense=Sum("amount")
            )
            .order_by("-total_expense")

        )

        return Response({

            "category_expenses":
                category_expenses

        })


# =========================================================
# MONTHLY EXPENSE TREND
# =========================================================

class MonthlyExpenseTrendView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        monthly_expenses = (

            Expense.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth(
                    "expense_date"
                )
            )
            .values("month")
            .annotate(
                total_expense=Sum(
                    "amount"
                )
            )
            .order_by("month")

        )

        result = []

        for item in monthly_expenses:

            month = item["month"]

            result.append({

                "month":
                    month.strftime(
                        "%b %Y"
                    ),

                "amount":
                    item["total_expense"]

            })

        return Response({

            "monthly_expenses":
                result

        })


# =========================================================
# INCOME VS EXPENSE TREND
# =========================================================

class IncomeExpenseTrendView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        income_data = (

            Income.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth(
                    "income_date"
                )
            )
            .values("month")
            .annotate(
                total_income=Sum(
                    "amount"
                )
            )
            .order_by("month")

        )

        expense_data = (

            Expense.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth(
                    "expense_date"
                )
            )
            .values("month")
            .annotate(
                total_expense=Sum(
                    "amount"
                )
            )
            .order_by("month")

        )

        income_by_month = {

            item["month"].strftime(
                "%Y-%m"
            ):
                item["total_income"]

            for item in income_data

        }

        expense_by_month = {

            item["month"].strftime(
                "%Y-%m"
            ):
                item["total_expense"]

            for item in expense_data

        }

        all_months = sorted(

            set(
                income_by_month.keys()
            )
            |
            set(
                expense_by_month.keys()
            )

        )

        result = []

        for month_key in all_months:

            month_date = None

            for item in income_data:

                if (
                    item["month"].strftime(
                        "%Y-%m"
                    )
                    == month_key
                ):

                    month_date = item[
                        "month"
                    ]

                    break

            if month_date is None:

                for item in expense_data:

                    if (
                        item["month"].strftime(
                            "%Y-%m"
                        )
                        == month_key
                    ):

                        month_date = item[
                            "month"
                        ]

                        break

            result.append({

                "month":
                    month_date.strftime(
                        "%b %Y"
                    ),

                "income":
                    income_by_month.get(
                        month_key,
                        Decimal("0.00")
                    ),

                "expense":
                    expense_by_month.get(
                        month_key,
                        Decimal("0.00")
                    ),

            })

        return Response({

            "income_vs_expense":
                result

        })


# =========================================================
# BUDGET UTILIZATION
# =========================================================

class BudgetUtilizationView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        budgets = Budget.objects.filter(
            user=user
        ).order_by(
            "-year",
            "-id"
        )

        result = []

        for budget in budgets:

            # ---------------------------------------------
            # Convert month name into month number
            # ---------------------------------------------

            try:

                import calendar

                month_number = list(
                    calendar.month_name
                ).index(
                    budget.month
                )

            except ValueError:

                continue

            # ---------------------------------------------
            # Expense for this budget
            # ---------------------------------------------

            total_expense = (

                Expense.objects
                .filter(
                    user=user,
                    category=budget.category,
                    expense_date__year=budget.year,
                    expense_date__month=month_number
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]

                or Decimal("0.00")

            )

            budget_amount = (
                budget.budget_amount
            )

            if budget_amount > 0:

                utilization = (

                    total_expense /
                    budget_amount

                ) * Decimal("100")

            else:

                utilization = Decimal(
                    "0.00"
                )

            utilization = min(
                utilization,
                Decimal("100")
            )

            remaining = (
                budget_amount -
                total_expense
            )

            result.append({

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
                    total_expense,

                "remaining_amount":
                    remaining,

                "utilization_percentage":
                    round(
                        utilization,
                        2
                    ),

            })

        return Response({

            "budget_utilization":
                result

        })


# =========================================================
# SAVINGS GOAL PROGRESS
# =========================================================

class SavingsGoalProgressView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        goals = (

            SavingsGoal.objects
            .filter(user=user)
            .order_by(
                "deadline",
                "-id"
            )

        )

        result = []

        for goal in goals:

            target_amount = (
                goal.target_amount
            )

            saved_amount = (
                goal.saved_amount
            )

            if target_amount > 0:

                progress = (

                    saved_amount /
                    target_amount

                ) * Decimal("100")

            else:

                progress = Decimal(
                    "0.00"
                )

            progress = min(
                progress,
                Decimal("100")
            )

            remaining_amount = max(

                target_amount -
                saved_amount,

                Decimal("0.00")

            )

            status = (

                "COMPLETED"

                if saved_amount >=
                target_amount

                else "IN_PROGRESS"

            )

            result.append({

                "id":
                    goal.id,

                "goal_name":
                    goal.goal_name,

                "target_amount":
                    target_amount,

                "saved_amount":
                    saved_amount,

                "remaining_amount":
                    remaining_amount,

                "progress_percentage":
                    round(
                        progress,
                        2
                    ),

                "status":
                    status,

                "deadline":
                    goal.deadline,

            })

        return Response({

            "savings_goals":
                result

        })


# =========================================================
# COMPLETE ANALYTICS DASHBOARD API
# =========================================================

class AnalyticsDashboardView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # =================================================
        # SUMMARY
        # =================================================

        total_income = (

            Income.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]

            or Decimal("0.00")

        )

        total_expense = (

            Expense.objects
            .filter(user=user)
            .aggregate(
                total=Sum("amount")
            )["total"]

            or Decimal("0.00")

        )

        total_savings = (

            SavingsGoal.objects
            .filter(user=user)
            .aggregate(
                total=Sum("saved_amount")
            )["total"]

            or Decimal("0.00")

        )

        total_budget = (

            Budget.objects
            .filter(user=user)
            .aggregate(
                total=Sum("budget_amount")
            )["total"]

            or Decimal("0.00")

        )

        current_balance = (
            total_income -
            total_expense
        )

        remaining_budget = (
            total_budget -
            total_expense
        )

        # =================================================
        # CATEGORY EXPENSES
        # =================================================

        category_expenses = list(

            Expense.objects
            .filter(user=user)
            .values("category")
            .annotate(
                total_expense=Sum(
                    "amount"
                )
            )
            .order_by(
                "-total_expense"
            )

        )

        # =================================================
        # MONTHLY EXPENSES
        # =================================================

        monthly_expenses = (

            Expense.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth(
                    "expense_date"
                )
            )
            .values("month")
            .annotate(
                total_expense=Sum(
                    "amount"
                )
            )
            .order_by("month")

        )

        monthly_expense_result = []

        for item in monthly_expenses:

            monthly_expense_result.append({

                "month":
                    item["month"].strftime(
                        "%b %Y"
                    ),

                "amount":
                    item["total_expense"]

            })

        # =================================================
        # MONTHLY INCOME + EXPENSE
        # =================================================

        income_data = (

            Income.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth(
                    "income_date"
                )
            )
            .values("month")
            .annotate(
                total_income=Sum(
                    "amount"
                )
            )
            .order_by("month")

        )

        expense_data = (

            Expense.objects
            .filter(user=user)
            .annotate(
                month=TruncMonth(
                    "expense_date"
                )
            )
            .values("month")
            .annotate(
                total_expense=Sum(
                    "amount"
                )
            )
            .order_by("month")

        )

        income_by_month = {

            item["month"].strftime(
                "%Y-%m"
            ):
                item["total_income"]

            for item in income_data

        }

        expense_by_month = {

            item["month"].strftime(
                "%Y-%m"
            ):
                item["total_expense"]

            for item in expense_data

        }

        all_months = sorted(

            set(
                income_by_month.keys()
            )
            |
            set(
                expense_by_month.keys()
            )

        )

        income_vs_expense = []

        for month_key in all_months:

            month_date = None

            if month_key in income_by_month:

                for item in income_data:

                    if (
                        item["month"].strftime(
                            "%Y-%m"
                        )
                        == month_key
                    ):

                        month_date = item[
                            "month"
                        ]

                        break

            else:

                for item in expense_data:

                    if (
                        item["month"].strftime(
                            "%Y-%m"
                        )
                        == month_key
                    ):

                        month_date = item[
                            "month"
                        ]

                        break

            income_vs_expense.append({

                "month":
                    month_date.strftime(
                        "%b %Y"
                    ),

                "income":
                    income_by_month.get(
                        month_key,
                        Decimal("0.00")
                    ),

                "expense":
                    expense_by_month.get(
                        month_key,
                        Decimal("0.00")
                    ),

            })

        # =================================================
        # BUDGET UTILIZATION
        # =================================================

        budgets = Budget.objects.filter(
            user=user
        ).order_by(
            "-year",
            "-id"
        )

        budget_utilization = []

        import calendar

        for budget in budgets:

            try:

                month_number = list(
                    calendar.month_name
                ).index(
                    budget.month
                )

            except ValueError:

                continue

            spent = (

                Expense.objects
                .filter(
                    user=user,
                    category=budget.category,
                    expense_date__year=budget.year,
                    expense_date__month=month_number
                )
                .aggregate(
                    total=Sum("amount")
                )["total"]

                or Decimal("0.00")

            )

            budget_amount = (
                budget.budget_amount
            )

            utilization = (

                (
                    spent /
                    budget_amount
                ) * Decimal("100")

                if budget_amount > 0

                else Decimal("0.00")

            )

            utilization = min(
                utilization,
                Decimal("100")
            )

            budget_utilization.append({

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
                    budget_amount -
                    spent,

                "utilization_percentage":
                    round(
                        utilization,
                        2
                    ),

            })

        # =================================================
        # SAVINGS GOALS
        # =================================================

        goals = (

            SavingsGoal.objects
            .filter(user=user)
            .order_by(
                "deadline",
                "-id"
            )

        )

        savings_goals = []

        for goal in goals:

            target = (
                goal.target_amount
            )

            saved = (
                goal.saved_amount
            )

            progress = (

                (
                    saved /
                    target
                ) * Decimal("100")

                if target > 0

                else Decimal("0.00")

            )

            progress = min(
                progress,
                Decimal("100")
            )

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
                    max(
                        target - saved,
                        Decimal("0.00")
                    ),

                "progress_percentage":
                    round(
                        progress,
                        2
                    ),

                "status":
                    (
                        "COMPLETED"
                        if saved >= target
                        else "IN_PROGRESS"
                    ),

                "deadline":
                    goal.deadline,

            })

        # =================================================
        # RECENT TRANSACTIONS
        # =================================================

        recent_expenses = list(

            Expense.objects
            .filter(user=user)
            .values(
                "id",
                "title",
                "amount",
                "category",
                "expense_date"
            )
            .order_by(
                "-expense_date",
                "-id"
            )[:5]

        )

        # =================================================
        # RESPONSE
        # =================================================

        return Response({

            "summary": {

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

            },

            "category_expenses":
                category_expenses,

            "monthly_expenses":
                monthly_expense_result,

            "income_vs_expense":
                income_vs_expense,

            "budget_utilization":
                budget_utilization,

            "savings_goals":
                savings_goals,

            "recent_transactions":
                recent_expenses,

        })