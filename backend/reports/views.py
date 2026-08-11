import calendar

from decimal import Decimal

from django.http import HttpResponse
from django.db.models import Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    extend_schema,
)

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from budgets.models import Budget, SavingsGoal
from expenses.models import Expense
from income.models import Income
from notifications.models import Notification

from .serializers import (
    CategoryExpenseResponseSerializer,
    DashboardResponseSerializer,
    ErrorResponseSerializer,
    FinancialSummaryResponseSerializer,
    IncomeExpenseResponseSerializer,
    MonthlyExpenseTrendResponseSerializer,
    MonthlyFinancialReportResponseSerializer,
    SavingsReportResponseSerializer,
)


# =========================================================
# COMMON PARAMETERS
# =========================================================

MONTH_PARAMETER = OpenApiParameter(
    name="month",
    type=OpenApiTypes.INT,
    location=OpenApiParameter.QUERY,
    required=False,
    description=(
        "Month number between 1 and 12. "
        "Defaults to the current month."
    ),
)


YEAR_PARAMETER = OpenApiParameter(
    name="year",
    type=OpenApiTypes.INT,
    location=OpenApiParameter.QUERY,
    required=False,
    description=(
        "Four-digit year. "
        "Defaults to the current year."
    ),
)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_month_and_year(request):
    """
    Read month and year from query parameters.

    Example:
        ?month=7&year=2026

    If month and year are not provided,
    the current month and year are used.
    """

    today = timezone.localdate()

    month_value = request.query_params.get(
        "month",
        today.month,
    )

    year_value = request.query_params.get(
        "year",
        today.year,
    )

    try:
        month = int(month_value)
        year = int(year_value)

    except (TypeError, ValueError):

        return None, None, Response(
            {
                "error": (
                    "Month and year must be valid numbers."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if month < 1 or month > 12:

        return None, None, Response(
            {
                "error": (
                    "Month must be between 1 and 12."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return month, year, None


def get_budget_for_month(user, month, year):
    """
    Return the total budget belonging to the
    requested month.

    Supports both formats:

        July

    and

        July 2026

    This prevents reports from accidentally
    adding budgets from every month.
    """

    month_name = calendar.month_name[month]

    budgets = Budget.objects.filter(
        user=user
    ).filter(
        Q(
            month__iexact=month_name
        )
        |
        Q(
            month__iexact=f"{month_name} {year}"
        )
    )

    total_budget = (
        budgets.aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    return total_budget


def get_date_range_from_filter(request):
    """
    Determine the start and end dates for:

        current_month
        previous_month
        custom

    Returns:

        start_date,
        end_date,
        filter_type,
        error_response
    """

    filter_type = request.query_params.get(
        "filter",
        "current_month",
    )

    today = timezone.localdate()

    # -----------------------------------------------------
    # CURRENT MONTH
    # -----------------------------------------------------

    if filter_type == "current_month":

        start_date = today.replace(
            day=1
        )

        end_date = today

        return (
            start_date,
            end_date,
            filter_type,
            None,
        )

    # -----------------------------------------------------
    # PREVIOUS MONTH
    # -----------------------------------------------------

    elif filter_type == "previous_month":

        if today.month == 1:

            previous_month = 12
            previous_year = today.year - 1

        else:

            previous_month = today.month - 1
            previous_year = today.year

        start_date = today.replace(
            year=previous_year,
            month=previous_month,
            day=1,
        )

        last_day = calendar.monthrange(
            previous_year,
            previous_month,
        )[1]

        end_date = start_date.replace(
            day=last_day
        )

        return (
            start_date,
            end_date,
            filter_type,
            None,
        )

    # -----------------------------------------------------
    # CUSTOM
    # -----------------------------------------------------

    elif filter_type == "custom":

        start_date_value = (
            request.query_params.get(
                "start_date"
            )
        )

        end_date_value = (
            request.query_params.get(
                "end_date"
            )
        )

        if (
            not start_date_value
            or not end_date_value
        ):

            return (
                None,
                None,
                filter_type,
                Response(
                    {
                        "error": (
                            "start_date and end_date "
                            "are required."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                ),
            )

        try:

            start_date = (
                timezone.datetime.strptime(
                    start_date_value,
                    "%Y-%m-%d",
                ).date()
            )

            end_date = (
                timezone.datetime.strptime(
                    end_date_value,
                    "%Y-%m-%d",
                ).date()
            )

        except ValueError:

            return (
                None,
                None,
                filter_type,
                Response(
                    {
                        "error": (
                            "Dates must be in "
                            "YYYY-MM-DD format."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                ),
            )

        if start_date > end_date:

            return (
                None,
                None,
                filter_type,
                Response(
                    {
                        "error": (
                            "start_date cannot be "
                            "after end_date."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                ),
            )

        return (
            start_date,
            end_date,
            filter_type,
            None,
        )

    # -----------------------------------------------------
    # INVALID FILTER
    # -----------------------------------------------------

    else:

        return (
            None,
            None,
            filter_type,
            Response(
                {
                    "error": (
                        "Invalid filter. Use "
                        "current_month, "
                        "previous_month "
                        "or custom."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            ),
        )


def get_category_summary(expenses):
    """
    Create category-wise expense summary.
    """

    category_data = (
        expenses
        .values("category")
        .annotate(
            amount=Sum("amount")
        )
        .order_by("-amount")
    )

    return list(category_data)


def calculate_budget_details(
    total_budget,
    total_expense,
):
    """
    Calculate:

        remaining budget
        usage percentage
        budget status
    """

    remaining_budget = (
        total_budget - total_expense
    )

    budget_usage_percentage = Decimal(
        "0.00"
    )

    if total_budget > 0:

        budget_usage_percentage = (
            total_expense
            / total_budget
        ) * Decimal("100")

    if total_budget == 0:

        budget_status = "NO_BUDGET"

    elif total_expense > total_budget:

        budget_status = "OVER_BUDGET"

    elif budget_usage_percentage >= 80:

        budget_status = "WARNING"

    else:

        budget_status = "SAFE"

    return (
        remaining_budget,
        budget_usage_percentage,
        budget_status,
    )


# =========================================================
# FINANCIAL SUMMARY
# =========================================================

class FinancialSummaryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        FinancialSummaryResponseSerializer
    )

    @extend_schema(
        responses={
            200: FinancialSummaryResponseSerializer
        },
        description=(
            "Return all-time income, expense "
            "and current balance."
        ),
    )
    def get(self, request):

        user = request.user

        # -------------------------------------------------
        # TOTAL INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects.filter(
                user=user
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # TOTAL EXPENSE
        # -------------------------------------------------

        total_expense = (
            Expense.objects.filter(
                user=user
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # BALANCE
        # -------------------------------------------------

        current_balance = (
            total_income - total_expense
        )

        return Response(
            {
                "total_income": total_income,
                "total_expense": total_expense,
                "current_balance": (
                    current_balance
                ),
            }
        )


# =========================================================
# DASHBOARD
# =========================================================

class DashboardAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        DashboardResponseSerializer
    )

    @extend_schema(
        responses={
            200: DashboardResponseSerializer
        },
        description=(
            "Return dashboard totals, current "
            "budget details and recent transactions."
        ),
    )
    def get(self, request):

        user = request.user

        today = timezone.localdate()

        current_month = today.strftime(
            "%B"
        )

        current_year = today.year

        # -------------------------------------------------
        # ALL-TIME INCOME
        # -------------------------------------------------

        incomes = Income.objects.filter(
            user=user
        )

        total_income = (
            incomes.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # ALL-TIME EXPENSE
        # -------------------------------------------------

        expenses = Expense.objects.filter(
            user=user
        )

        total_expense = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # ALL-TIME BALANCE
        # -------------------------------------------------

        balance = (
            total_income - total_expense
        )

        # -------------------------------------------------
        # CURRENT MONTH BUDGET
        # -------------------------------------------------

        total_budget = (
            get_budget_for_month(
                user,
                today.month,
                today.year,
            )
        )

        # -------------------------------------------------
        # CURRENT MONTH EXPENSE
        # -------------------------------------------------

        current_month_expense = (
            expenses.filter(
                date__year=today.year,
                date__month=today.month,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # REMAINING CURRENT MONTH BUDGET
        # -------------------------------------------------

        remaining_budget = (
            total_budget
            - current_month_expense
        )

        # -------------------------------------------------
        # RECENT INCOMES
        # -------------------------------------------------

        recent_incomes = [

            {
                "id": income.id,
                "type": "income",
                "title": income.title,
                "source": income.source,
                "amount": income.amount,
                "date": income.income_date,
                "description": (
                    income.description
                ),
            }

            for income in (
                incomes
                .order_by(
                    "-income_date",
                    "-id",
                )[:5]
            )
        ]

        # -------------------------------------------------
        # RECENT EXPENSES
        # -------------------------------------------------

        recent_expenses = [

            {
                "id": expense.id,
                "type": "expense",
                "title": expense.title,
                "amount": expense.amount,
                "category": expense.category,
                "date": expense.date,
                "description": (
                    expense.description
                ),
            }

            for expense in (
                expenses
                .order_by(
                    "-date",
                    "-id",
                )[:5]
            )
        ]

        # -------------------------------------------------
        # COMBINE TRANSACTIONS
        # -------------------------------------------------

        recent_transactions = (
            recent_incomes
            + recent_expenses
        )

        recent_transactions = sorted(
            recent_transactions,
            key=lambda transaction: (
                transaction["date"]
            ),
            reverse=True,
        )[:10]

        return Response(
            {
                "month": current_month,
                "year": current_year,

                "total_income": (
                    total_income
                ),

                "total_expense": (
                    total_expense
                ),

                "balance": balance,

                "total_budget": (
                    total_budget
                ),

                "current_month_expense": (
                    current_month_expense
                ),

                "remaining_budget": (
                    remaining_budget
                ),

                "recent_transactions": (
                    recent_transactions
                ),
            }
        )


# =========================================================
# MONTHLY EXPENSE TREND
# =========================================================

class MonthlyExpenseTrendAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        MonthlyExpenseTrendResponseSerializer
    )

    @extend_schema(
        parameters=[
            YEAR_PARAMETER
        ],
        responses={
            200: (
                MonthlyExpenseTrendResponseSerializer
            ),
            400: ErrorResponseSerializer,
        },
    )
    def get(self, request):

        year_value = request.query_params.get(
            "year",
            timezone.localdate().year,
        )

        try:

            year = int(year_value)

        except (TypeError, ValueError):

            return Response(
                {
                    "error": (
                        "Year must be a valid number."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        monthly_data = (
            Expense.objects.filter(
                user=request.user,
                date__year=year,
            )
            .annotate(
                month=TruncMonth("date")
            )
            .values("month")
            .annotate(
                total_expense=Sum("amount")
            )
            .order_by("month")
        )

        totals_by_month = {
            item["month"].month:
                item["total_expense"]

            for item in monthly_data
        }

        result = []

        for month_number in range(
            1,
            13,
        ):

            result.append(
                {
                    "month_number": (
                        month_number
                    ),

                    "month": (
                        calendar.month_name[
                            month_number
                        ]
                    ),

                    "total_expense": (
                        totals_by_month.get(
                            month_number,
                            Decimal("0.00"),
                        )
                    ),
                }
            )

        return Response(
            {
                "year": year,
                "monthly_expenses": result,
            }
        )


# =========================================================
# CATEGORY EXPENSE ANALYSIS
# =========================================================

class CategoryExpenseAnalysisAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        CategoryExpenseResponseSerializer
    )

    @extend_schema(
        parameters=[
            MONTH_PARAMETER,
            YEAR_PARAMETER,
        ],
        responses={
            200: (
                CategoryExpenseResponseSerializer
            ),
            400: ErrorResponseSerializer,
        },
    )
    def get(self, request):

        month, year, error_response = (
            get_month_and_year(request)
        )

        if error_response:

            return error_response

        expenses = Expense.objects.filter(
            user=request.user,
            date__month=month,
            date__year=year,
        )

        category_data = (
            expenses
            .values("category")
            .annotate(
                amount=Sum("amount")
            )
            .order_by("-amount")
        )

        total_expense = sum(
            (
                item["amount"]
                for item in category_data
            ),
            Decimal("0.00"),
        )

        categories = []

        for item in category_data:

            percentage = Decimal(
                "0.00"
            )

            if total_expense > 0:

                percentage = (
                    item["amount"]
                    / total_expense
                ) * Decimal("100")

            categories.append(
                {
                    "category": (
                        item["category"]
                    ),

                    "amount": (
                        item["amount"]
                    ),

                    "percentage": round(
                        float(
                            percentage
                        ),
                        2,
                    ),
                }
            )

        return Response(
            {
                "month": (
                    calendar.month_name[
                        month
                    ]
                ),

                "month_number": month,

                "year": year,

                "total_expense": (
                    total_expense
                ),

                "categories": categories,
            }
        )


# =========================================================
# INCOME VS EXPENSE
# =========================================================

class IncomeExpenseComparisonAPIView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        IncomeExpenseResponseSerializer
    )

    @extend_schema(
        parameters=[
            MONTH_PARAMETER,
            YEAR_PARAMETER,
        ],
        responses={
            200: (
                IncomeExpenseResponseSerializer
            ),
            400: ErrorResponseSerializer,
        },
    )
    def get(self, request):

        month, year, error_response = (
            get_month_and_year(request)
        )

        if error_response:

            return error_response

        # -------------------------------------------------
        # INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects.filter(
                user=request.user,
                income_date__month=month,
                income_date__year=year,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # EXPENSE
        # -------------------------------------------------

        total_expense = (
            Expense.objects.filter(
                user=request.user,
                date__month=month,
                date__year=year,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # BALANCE
        # -------------------------------------------------

        balance = (
            total_income - total_expense
        )

        if balance > 0:

            financial_status = "SURPLUS"

        elif balance < 0:

            financial_status = "DEFICIT"

        else:

            financial_status = "BALANCED"

        return Response(
            {
                "month": (
                    calendar.month_name[
                        month
                    ]
                ),

                "month_number": month,

                "year": year,

                "total_income": (
                    total_income
                ),

                "total_expense": (
                    total_expense
                ),

                "balance": balance,

                "status": financial_status,
            }
        )


# =========================================================
# SAVINGS REPORT
# =========================================================

class SavingsReportAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        SavingsReportResponseSerializer
    )

    @extend_schema(
        responses={
            200: (
                SavingsReportResponseSerializer
            )
        },
    )
    def get(self, request):

        savings_goals = (
            SavingsGoal.objects.filter(
                user=request.user
            )
        )

        # -------------------------------------------------
        # TOTAL TARGET
        # -------------------------------------------------

        total_target = (
            savings_goals.aggregate(
                total=Sum("target_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # TOTAL SAVED
        # -------------------------------------------------

        total_saved = (
            savings_goals.aggregate(
                total=Sum("saved_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # REMAINING
        # -------------------------------------------------

        remaining_amount = max(
            total_target - total_saved,
            Decimal("0.00"),
        )

        # -------------------------------------------------
        # OVERALL PROGRESS
        # -------------------------------------------------

        overall_progress = Decimal(
            "0.00"
        )

        if total_target > 0:

            overall_progress = (
                total_saved
                / total_target
            ) * Decimal("100")

        goals = []

        # -------------------------------------------------
        # INDIVIDUAL GOALS
        # -------------------------------------------------

        for goal in (
            savings_goals
            .order_by("-created_at")
        ):

            goal_progress = Decimal(
                "0.00"
            )

            if goal.target_amount > 0:

                goal_progress = (
                    goal.saved_amount
                    / goal.target_amount
                ) * Decimal("100")

            # ---------------------------------------------
            # STATUS
            # ---------------------------------------------

            if (
                goal.saved_amount
                >= goal.target_amount
            ):

                goal_status = "COMPLETED"

            elif goal.saved_amount > 0:

                goal_status = "IN_PROGRESS"

            else:

                goal_status = "NOT_STARTED"

            goals.append(
                {
                    "id": goal.id,

                    "title": goal.title,

                    "target_amount": (
                        goal.target_amount
                    ),

                    "saved_amount": (
                        goal.saved_amount
                    ),

                    "remaining_amount": max(
                        goal.target_amount
                        - goal.saved_amount,
                        Decimal("0.00"),
                    ),

                    "progress_percentage": (
                        round(
                            float(
                                goal_progress
                            ),
                            2,
                        )
                    ),

                    "status": goal_status,

                    "target_date": (
                        goal.target_date
                    ),
                }
            )

        return Response(
            {
                "total_goals": (
                    savings_goals.count()
                ),

                "total_target": (
                    total_target
                ),

                "total_saved": (
                    total_saved
                ),

                "remaining_amount": (
                    remaining_amount
                ),

                "overall_progress": (
                    round(
                        float(
                            overall_progress
                        ),
                        2,
                    )
                ),

                "goals": goals,
            }
        )


# =========================================================
# MONTHLY FINANCIAL REPORT
# =========================================================

class MonthlyFinancialReportAPIView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        MonthlyFinancialReportResponseSerializer
    )

    @extend_schema(
        parameters=[
            MONTH_PARAMETER,
            YEAR_PARAMETER,
        ],
        responses={
            200: (
                MonthlyFinancialReportResponseSerializer
            ),
            400: ErrorResponseSerializer,
        },
    )
    def get(self, request):

        month, year, error_response = (
            get_month_and_year(request)
        )

        if error_response:

            return error_response

        user = request.user

        month_name = (
            calendar.month_name[month]
        )

        # -------------------------------------------------
        # INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects.filter(
                user=user,
                income_date__month=month,
                income_date__year=year,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # EXPENSE
        # -------------------------------------------------

        expenses = Expense.objects.filter(
            user=user,
            date__month=month,
            date__year=year,
        )

        total_expense = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # MONTHLY BUDGET
        #
        # IMPORTANT:
        # Only selected month budget is used.
        # -------------------------------------------------

        total_budget = (
            get_budget_for_month(
                user,
                month,
                year,
            )
        )

        (
            remaining_budget,
            budget_usage_percentage,
            budget_status,
        ) = calculate_budget_details(
            total_budget,
            total_expense,
        )

        # -------------------------------------------------
        # SAVINGS
        # -------------------------------------------------

        savings_goals = (
            SavingsGoal.objects.filter(
                user=user
            )
        )

        total_savings_target = (
            savings_goals.aggregate(
                total=Sum("target_amount")
            )["total"]
            or Decimal("0.00")
        )

        total_saved = (
            savings_goals.aggregate(
                total=Sum("saved_amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # BALANCE
        # -------------------------------------------------

        balance = (
            total_income - total_expense
        )

        # -------------------------------------------------
        # CATEGORY BREAKDOWN
        # -------------------------------------------------

        category_data = (
            expenses
            .values("category")
            .annotate(
                amount=Sum("amount")
            )
            .order_by("-amount")
        )

        return Response(
            {
                "month": month_name,

                "month_number": month,

                "year": year,

                "income": {
                    "total": total_income,
                },

                "expense": {
                    "total": total_expense,

                    "category_breakdown": list(
                        category_data
                    ),
                },

                "budget": {
                    "total": total_budget,

                    "spent": total_expense,

                    "remaining": (
                        remaining_budget
                    ),

                    "usage_percentage": (
                        round(
                            float(
                                budget_usage_percentage
                            ),
                            2,
                        )
                    ),

                    "status": budget_status,
                },

                "savings": {
                    "total_target": (
                        total_savings_target
                    ),

                    "total_saved": total_saved,

                    "remaining": max(
                        total_savings_target
                        - total_saved,
                        Decimal("0.00"),
                    ),
                },

                "balance": balance,
            }
        )


# =========================================================
# EXPENSE REPORT
# =========================================================

class ExpenseReportAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        expenses = Expense.objects.filter(
            user=user
        )

        # -------------------------------------------------
        # FILTER
        # -------------------------------------------------

        filter_type = (
            request.query_params.get(
                "filter",
                "current_month",
            )
        )

        today = timezone.localdate()

        # -------------------------------------------------
        # CURRENT MONTH
        # -------------------------------------------------

        if filter_type == "current_month":

            expenses = expenses.filter(
                date__year=today.year,
                date__month=today.month,
            )

        # -------------------------------------------------
        # PREVIOUS MONTH
        # -------------------------------------------------

        elif filter_type == "previous_month":

            if today.month == 1:

                previous_month = 12
                previous_year = (
                    today.year - 1
                )

            else:

                previous_month = (
                    today.month - 1
                )

                previous_year = today.year

            expenses = expenses.filter(
                date__year=previous_year,
                date__month=previous_month,
            )

        # -------------------------------------------------
        # CUSTOM
        # -------------------------------------------------

        elif filter_type == "custom":

            start_date = (
                request.query_params.get(
                    "start_date"
                )
            )

            end_date = (
                request.query_params.get(
                    "end_date"
                )
            )

            if (
                not start_date
                or not end_date
            ):

                return Response(
                    {
                        "error": (
                            "start_date and end_date "
                            "are required for custom "
                            "filter."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                )

            try:

                start_date = (
                    timezone.datetime.strptime(
                        start_date,
                        "%Y-%m-%d",
                    ).date()
                )

                end_date = (
                    timezone.datetime.strptime(
                        end_date,
                        "%Y-%m-%d",
                    ).date()
                )

            except ValueError:

                return Response(
                    {
                        "error": (
                            "Dates must be in "
                            "YYYY-MM-DD format."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                )

            if start_date > end_date:

                return Response(
                    {
                        "error": (
                            "start_date cannot be "
                            "after end_date."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                )

            expenses = expenses.filter(
                date__gte=start_date,
                date__lte=end_date,
            )

        # -------------------------------------------------
        # INVALID FILTER
        # -------------------------------------------------

        else:

            return Response(
                {
                    "error": (
                        "Invalid filter. Use "
                        "current_month, "
                        "previous_month "
                        "or custom."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        # -------------------------------------------------
        # ORDER
        # -------------------------------------------------

        expenses = expenses.order_by(
            "-date",
            "-id",
        )

        # -------------------------------------------------
        # EXPENSE DATA
        # -------------------------------------------------

        expense_data = []

        for expense in expenses:

            expense_data.append(
                {
                    "id": expense.id,

                    "title": expense.title,

                    "category": (
                        expense.category
                    ),

                    "amount": expense.amount,

                    "date": expense.date,

                    "description": (
                        expense.description
                    ),
                }
            )

        # -------------------------------------------------
        # TOTAL
        # -------------------------------------------------

        total_expense = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        return Response(
            {
                "filter": filter_type,

                "total_expense": (
                    total_expense
                ),

                "expense_count": len(
                    expense_data
                ),

                "expenses": expense_data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# FINANCIAL SUMMARY REPORT
# =========================================================

class FinancialSummaryReportAPIView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # -------------------------------------------------
        # DATE RANGE
        # -------------------------------------------------

        (
            start_date,
            end_date,
            filter_type,
            error_response,
        ) = get_date_range_from_filter(
            request
        )

        if error_response:

            return error_response

        # -------------------------------------------------
        # INCOME
        # -------------------------------------------------

        incomes = Income.objects.filter(
            user=user,
            income_date__gte=start_date,
            income_date__lte=end_date,
        )

        total_income = (
            incomes.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # EXPENSE
        # -------------------------------------------------

        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
        )

        total_expense = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # BALANCE
        # -------------------------------------------------

        current_balance = (
            total_income - total_expense
        )

        # -------------------------------------------------
        # BUDGET
        #
        # IMPORTANT:
        #
        # For current_month:
        #     use current month's budget.
        #
        # For previous_month:
        #     use previous month's budget.
        #
        # For custom:
        #     use the budget of the month in which
        #     start_date falls.
        #
        # We DO NOT add budgets from every month.
        # -------------------------------------------------

        budget_month = (
            start_date.month
        )

        budget_year = (
            start_date.year
        )

        total_budget = (
            get_budget_for_month(
                user,
                budget_month,
                budget_year,
            )
        )

        (
            remaining_budget,
            budget_usage,
            budget_status,
        ) = calculate_budget_details(
            total_budget,
            total_expense,
        )

        # -------------------------------------------------
        # SAVINGS
        # -------------------------------------------------

        savings_goals = (
            SavingsGoal.objects.filter(
                user=user
            )
        )

        total_target = (
            savings_goals.aggregate(
                total=Sum("target_amount")
            )["total"]
            or Decimal("0.00")
        )

        total_saved = (
            savings_goals.aggregate(
                total=Sum("saved_amount")
            )["total"]
            or Decimal("0.00")
        )

        savings_remaining = max(
            total_target - total_saved,
            Decimal("0.00"),
        )

        savings_progress = Decimal(
            "0.00"
        )

        if total_target > 0:

            savings_progress = (
                total_saved
                / total_target
            ) * Decimal("100")

        # -------------------------------------------------
        # CATEGORY BREAKDOWN
        # -------------------------------------------------

        category_summary = (
            expenses
            .values("category")
            .annotate(
                total=Sum("amount")
            )
            .order_by("-total")
        )

        category_summary = list(
            category_summary
        )

        # -------------------------------------------------
        # NOTIFICATIONS
        # -------------------------------------------------

        notifications = []

        try:

            notifications_queryset = (
                Notification.objects
                .filter(
                    user=user,
                    is_archived=False,
                )
                .order_by(
                    "-created_at"
                )[:5]
            )

            for notification in (
                notifications_queryset
            ):

                notifications.append(
                    {
                        "id": (
                            notification.id
                        ),

                        "title": (
                            notification.title
                        ),

                        "message": (
                            notification.message
                        ),

                        "notification_type": (
                            notification.notification_type
                        ),

                        "priority": (
                            notification.priority
                        ),

                        "is_read": (
                            notification.is_read
                        ),

                        "created_at": (
                            notification.created_at
                        ),
                    }
                )

        except Exception:

            notifications = []

        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        return Response(
            {
                "report": {

                    "filter": filter_type,

                    "start_date": (
                        start_date
                    ),

                    "end_date": (
                        end_date
                    ),
                },

                "financial_summary": {

                    "total_income": (
                        total_income
                    ),

                    "total_expense": (
                        total_expense
                    ),

                    "current_balance": (
                        current_balance
                    ),
                },

                "expense_summary": {

                    "total_expense": (
                        total_expense
                    ),

                    "category_breakdown": (
                        category_summary
                    ),

                    "expense_count": (
                        expenses.count()
                    ),
                },

                "income_summary": {

                    "total_income": (
                        total_income
                    ),

                    "income_count": (
                        incomes.count()
                    ),
                },

                "budget_summary": {

                    "total_budget": (
                        total_budget
                    ),

                    "spent": (
                        total_expense
                    ),

                    "remaining_budget": (
                        remaining_budget
                    ),

                    "usage_percentage": round(
                        float(
                            budget_usage
                        ),
                        2,
                    ),

                    "status": (
                        budget_status
                    ),
                },

                "savings_summary": {

                    "total_target": (
                        total_target
                    ),

                    "total_saved": (
                        total_saved
                    ),

                    "remaining_amount": (
                        savings_remaining
                    ),

                    "progress_percentage": (
                        round(
                            float(
                                savings_progress
                            ),
                            2,
                        )
                    ),
                },

                "latest_notifications": (
                    notifications
                ),
            },

            status=status.HTTP_200_OK,
        )


# =========================================================
# PDF REPORT
# =========================================================

class DownloadPDFReportAPIView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # -------------------------------------------------
        # DATE RANGE
        # -------------------------------------------------

        (
            start_date,
            end_date,
            filter_type,
            error_response,
        ) = get_date_range_from_filter(
            request
        )

        if error_response:

            return error_response

        # -------------------------------------------------
        # INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects.filter(
                user=user,
                income_date__gte=start_date,
                income_date__lte=end_date,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # EXPENSE
        # -------------------------------------------------

        total_expense = (
            Expense.objects.filter(
                user=user,
                date__gte=start_date,
                date__lte=end_date,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # BALANCE
        # -------------------------------------------------

        balance = (
            total_income - total_expense
        )

        # -------------------------------------------------
        # MONTHLY BUDGET
        #
        # IMPORTANT:
        # Only the report month's budget is used.
        # -------------------------------------------------

        budget_month = (
            start_date.month
        )

        budget_year = (
            start_date.year
        )

        total_budget = (
            get_budget_for_month(
                user,
                budget_month,
                budget_year,
            )
        )

        # -------------------------------------------------
        # BUDGET DETAILS
        # -------------------------------------------------

        (
            remaining_budget,
            budget_usage,
            budget_status,
        ) = calculate_budget_details(
            total_budget,
            total_expense,
        )

        # -------------------------------------------------
        # SAVINGS GOALS
        # -------------------------------------------------

        savings_goals = (
            SavingsGoal.objects.filter(
                user=user
            )
        )

        # -------------------------------------------------
        # PDF RESPONSE
        # -------------------------------------------------

        response = HttpResponse(
            content_type="application/pdf"
        )

        response[
            "Content-Disposition"
        ] = (
            'attachment; '
            'filename="financial_report.pdf"'
        )

        document = SimpleDocTemplate(
            response
        )

        styles = (
            getSampleStyleSheet()
        )

        elements = []

        # =================================================
        # TITLE
        # =================================================

        elements.append(
            Paragraph(
                (
                    "<b>"
                    "BudgetBuddy Financial Report"
                    "</b>"
                ),
                styles["Title"],
            )
        )

        # =================================================
        # PERIOD
        # =================================================

        elements.append(
            Paragraph(
                (
                    f"Report Period : "
                    f"{start_date} "
                    f"to "
                    f"{end_date}"
                ),
                styles["Normal"],
            )
        )

        # =================================================
        # FILTER
        # =================================================

        elements.append(
            Paragraph(
                (
                    f"Filter : "
                    f"{filter_type}"
                ),
                styles["Normal"],
            )
        )

        # =================================================
        # FINANCIAL SUMMARY
        # =================================================

        elements.append(
            Paragraph(
                (
                    f"Total Income : "
                    f"₹{total_income}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Total Expense : "
                    f"₹{total_expense}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Current Balance : "
                    f"₹{balance}"
                ),
                styles["Normal"],
            )
        )

        # =================================================
        # BUDGET
        # =================================================

        elements.append(
            Paragraph(
                (
                    f"Total Budget : "
                    f"₹{total_budget}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Budget Spent : "
                    f"₹{total_expense}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Remaining Budget : "
                    f"₹{remaining_budget}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Budget Usage : "
                    f"{round(float(budget_usage), 2)}%"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Budget Status : "
                    f"{budget_status}"
                ),
                styles["Normal"],
            )
        )

        # =================================================
        # SAVINGS GOALS
        # =================================================

        elements.append(
            Paragraph(
                (
                    "<br/>"
                    "<b>Savings Goals</b>"
                ),
                styles["Heading2"],
            )
        )

        if savings_goals.exists():
            for goal in savings_goals:

                progress = 0

                if goal.target_amount > 0:
                    progress = round(
                        float(
                            goal.saved_amount
                            / goal.target_amount
                            * 100
                        ),
                        2,
                    )

                remaining_amount = max(
                    goal.target_amount - goal.saved_amount,
                    Decimal("0.00"),
    )

                elements.append(
                    Paragraph(
                        (
                            f"<b>{goal.title}</b><br/>"
                            f"Target : ₹{goal.target_amount}<br/>"
                            f"Saved : ₹{goal.saved_amount}<br/>"
                            f"Remaining : ₹{remaining_amount}<br/>"
                            f"Progress : {progress}%"
                            f"<br/><br/>"
                         ),
                        styles["Normal"],
        )
    )
            
        else:

            elements.append(
                Paragraph(
                    (
                        "No Savings Goals Found."
                    ),
                    styles["Normal"],
                )
            )

        # =================================================
        # BUILD PDF
        # =================================================

        document.build(
            elements
        )

        return response