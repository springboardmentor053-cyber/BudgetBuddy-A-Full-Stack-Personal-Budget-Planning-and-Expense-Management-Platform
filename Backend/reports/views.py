from decimal import Decimal
from datetime import date, datetime
import calendar
import csv

from django.db.models import Sum
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal

from .models import Report
from .serializers import ReportSerializer


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_month_dates(year, month):
    """
    Return the first and last date of a selected month.
    """

    first_day = date(
        year,
        month,
        1
    )

    last_day = date(
        year,
        month,
        calendar.monthrange(
            year,
            month
        )[1]
    )

    return first_day, last_day


# =========================================================
# DATE RANGE HELPER
# =========================================================

def get_requested_date_range(request):
    """
    Supports:

    period=current
    period=previous

    OR:

    start_date=YYYY-MM-DD
    end_date=YYYY-MM-DD
    """

    today = date.today()

    period = request.query_params.get(
        "period"
    )

    # -----------------------------------------------------
    # CURRENT MONTH
    # -----------------------------------------------------

    if period == "current":

        return get_month_dates(
            today.year,
            today.month
        )

    # -----------------------------------------------------
    # PREVIOUS MONTH
    # -----------------------------------------------------

    if period == "previous":

        if today.month == 1:

            year = today.year - 1
            month = 12

        else:

            year = today.year
            month = today.month - 1

        return get_month_dates(
            year,
            month
        )

    # -----------------------------------------------------
    # CUSTOM DATE RANGE
    # -----------------------------------------------------

    start_date_string = (
        request.query_params.get(
            "start_date"
        )
    )

    end_date_string = (
        request.query_params.get(
            "end_date"
        )
    )

    if (
        start_date_string
        and
        end_date_string
    ):

        try:

            start_date = datetime.strptime(
                start_date_string,
                "%Y-%m-%d"
            ).date()

            end_date = datetime.strptime(
                end_date_string,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return None, None

        return start_date, end_date

    # -----------------------------------------------------
    # DEFAULT = CURRENT MONTH
    # -----------------------------------------------------

    return get_month_dates(
        today.year,
        today.month
    )


# =========================================================
# FINANCIAL DATA CALCULATION
# =========================================================

def calculate_financial_data(
    user,
    start_date,
    end_date
):
    """
    Calculate income, expenses and budget
    for a selected date range.
    """

    # -----------------------------------------------------
    # TOTAL INCOME
    # -----------------------------------------------------

    total_income = (
        Income.objects
        .filter(
            user=user,
            income_date__range=[
                start_date,
                end_date
            ]
        )
        .aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )


    # -----------------------------------------------------
    # TOTAL EXPENSE
    # -----------------------------------------------------

    total_expense = (
        Expense.objects
        .filter(
            user=user,
            expense_date__range=[
                start_date,
                end_date
            ]
        )
        .aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )


    # -----------------------------------------------------
    # CURRENT BALANCE
    # -----------------------------------------------------

    current_balance = (
        total_income -
        total_expense
    )


    # -----------------------------------------------------
    # TOTAL SAVINGS
    # -----------------------------------------------------

    total_savings = (
        total_income -
        total_expense
    )


    # -----------------------------------------------------
    # TOTAL BUDGET
    # -----------------------------------------------------

    total_budget = (
        Budget.objects
        .filter(
            user=user,
            year=start_date.year,
            month__iexact=start_date.strftime("%B")
        )
        .aggregate(
            total=Sum("budget_amount")
        )["total"]
        or Decimal("0.00")
    )


    # -----------------------------------------------------
    # REMAINING BUDGET
    # -----------------------------------------------------

    remaining_budget = (
        total_budget -
        total_expense
    )


    return {

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

    }


# =========================================================
# FINANCIAL ANALYTICS DASHBOARD
# =========================================================

class DashboardView(APIView):

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
            .filter(
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
            Expense.objects
            .filter(
                user=user
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )


        # -------------------------------------------------
        # TOTAL SAVINGS
        # -------------------------------------------------

        total_savings = (
            total_income -
            total_expense
        )


        # -------------------------------------------------
        # TRANSACTION COUNTS
        # -------------------------------------------------

        income_transactions = (
            Income.objects
            .filter(
                user=user
            )
            .count()
        )

        expense_transactions = (
            Expense.objects
            .filter(
                user=user
            )
            .count()
        )


        # -------------------------------------------------
        # EXPENSE BY CATEGORY
        # -------------------------------------------------

        expense_by_category = list(

            Expense.objects
            .filter(
                user=user
            )
            .values(
                "category"
            )
            .annotate(
                total=Sum("amount")
            )
            .order_by(
                "-total"
            )

        )


        # -------------------------------------------------
        # RECENT INCOME
        # -------------------------------------------------

        recent_income = list(

            Income.objects
            .filter(
                user=user
            )
            .values(
                "id",
                "title",
                "amount",
                "source",
                "income_date"
            )
            .order_by(
                "-income_date",
                "-id"
            )[:5]

        )


        # -------------------------------------------------
        # RECENT EXPENSES
        # -------------------------------------------------

        recent_expenses = list(

            Expense.objects
            .filter(
                user=user
            )
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


        # -------------------------------------------------
        # INCOME VS EXPENSE VS SAVINGS
        # -------------------------------------------------

        income_vs_expense = [

            {
                "name": "Income",
                "amount": total_income
            },

            {
                "name": "Expense",
                "amount": total_expense
            },

            {
                "name": "Savings",
                "amount": total_savings
            }

        ]


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return Response({

            "total_income":
                total_income,

            "total_expense":
                total_expense,

            "total_savings":
                total_savings,

            "income_transactions":
                income_transactions,

            "expense_transactions":
                expense_transactions,

            "expense_by_category":
                expense_by_category,

            "income_vs_expense":
                income_vs_expense,

            "recent_income":
                recent_income,

            "recent_expenses":
                recent_expenses,

        })


# =========================================================
# GENERATE MONTHLY REPORT
# =========================================================

class GenerateReportView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        user = request.user

        current_date = date.today()

        current_month = (
            current_date.strftime(
                "%B"
            )
        )

        current_year = (
            current_date.year
        )


        # -------------------------------------------------
        # MONTHLY INCOME
        # -------------------------------------------------

        total_income = (
            Income.objects
            .filter(
                user=user,
                income_date__year=current_year,
                income_date__month=current_date.month
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )


        # -------------------------------------------------
        # MONTHLY EXPENSE
        # -------------------------------------------------

        total_expense = (
            Expense.objects
            .filter(
                user=user,
                expense_date__year=current_year,
                expense_date__month=current_date.month
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )


        # -------------------------------------------------
        # SAVINGS
        # -------------------------------------------------

        savings = (
            total_income -
            total_expense
        )


        # -------------------------------------------------
        # CREATE OR UPDATE REPORT
        # -------------------------------------------------

        report, created = (
            Report.objects.update_or_create(

                user=user,

                month=current_month,

                defaults={

                    "total_income":
                        total_income,

                    "total_expense":
                        total_expense,

                    "savings":
                        savings,

                }

            )
        )


        # -------------------------------------------------
        # SERIALIZE
        # -------------------------------------------------

        serializer = ReportSerializer(
            report
        )


        return Response({

            "message":
                "Monthly report generated successfully.",

            "report":
                serializer.data

        })


# =========================================================
# MONTHLY FINANCIAL REPORT API
# =========================================================

class MonthlyFinancialReportView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user


        # -------------------------------------------------
        # MONTH / YEAR
        # -------------------------------------------------

        month_string = (
            request.query_params.get(
                "month"
            )
        )

        year_string = (
            request.query_params.get(
                "year"
            )
        )


        try:

            if month_string:

                month = int(
                    month_string
                )

            else:

                month = date.today().month


            if year_string:

                year = int(
                    year_string
                )

            else:

                year = date.today().year


            if (
                month < 1
                or
                month > 12
            ):

                raise ValueError


        except ValueError:

            return Response(

                {
                    "error":
                        "Month must be between 1 and 12 and year must be valid."
                },

                status=400

            )


        start_date, end_date = (
            get_month_dates(
                year,
                month
            )
        )


        data = calculate_financial_data(

            user,

            start_date,

            end_date

        )


        return Response({

            "report_type":
                "Monthly Financial Report",

            "month":
                start_date.strftime(
                    "%B"
                ),

            "year":
                year,

            "start_date":
                start_date,

            "end_date":
                end_date,

            "total_income":
                data["total_income"],

            "total_expense":
                data["total_expense"],

            "current_balance":
                data["current_balance"],

            "total_savings":
                data["total_savings"],

            "remaining_budget":
                data["remaining_budget"],

        })


# =========================================================
# EXPENSE REPORT API
# =========================================================

class ExpenseReportView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user


        start_date, end_date = (
            get_requested_date_range(
                request
            )
        )


        if start_date is None:

            return Response(

                {
                    "error":
                        "Invalid date format. Use YYYY-MM-DD."
                },

                status=400

            )


        if start_date > end_date:

            return Response(

                {
                    "error":
                        "Start date cannot be after end date."
                },

                status=400

            )


        expenses = list(

            Expense.objects
            .filter(
                user=user,
                expense_date__range=[
                    start_date,
                    end_date
                ]
            )
            .values(
                "id",
                "title",
                "category",
                "amount",
                "expense_date",
                "description"
            )
            .order_by(
                "expense_date",
                "id"
            )

        )


        total_expense = sum(

            (
                item["amount"]
                for item in expenses
            ),

            Decimal("0.00")

        )


        return Response({

            "report_type":
                "Expense Report",

            "start_date":
                start_date,

            "end_date":
                end_date,

            "total_expense":
                total_expense,

            "expenses":
                expenses,

        })


# =========================================================
# SAVINGS REPORT API
# =========================================================

class SavingsReportView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user


        goals = (

            SavingsGoal.objects
            .filter(
                user=user
            )
            .order_by(
                "deadline",
                "-id"
            )

        )


        savings_data = []


        for goal in goals:

            target_amount = (
                goal.target_amount
            )

            saved_amount = (
                goal.saved_amount
            )


            remaining_amount = max(

                target_amount -
                saved_amount,

                Decimal("0.00")

            )


            if target_amount > 0:

                progress_percentage = (

                    saved_amount /
                    target_amount

                ) * Decimal("100")


                progress_percentage = min(

                    progress_percentage,

                    Decimal("100")

                )

            else:

                progress_percentage = (
                    Decimal("0.00")
                )


            if (
                saved_amount >=
                target_amount
            ):

                status = "COMPLETED"

            else:

                status = "IN_PROGRESS"


            savings_data.append({

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
                        progress_percentage,
                        2
                    ),

                "status":
                    status,

                "deadline":
                    goal.deadline,

            })


        return Response({

            "report_type":
                "Savings Report",

            "total_goals":
                len(savings_data),

            "goals":
                savings_data,

        })


# =========================================================
# FINANCIAL SUMMARY REPORT
# =========================================================

class FinancialSummaryReportView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user


        start_date, end_date = (
            get_requested_date_range(
                request
            )
        )


        if start_date is None:

            return Response(

                {
                    "error":
                        "Invalid date format. Use YYYY-MM-DD."
                },

                status=400

            )


        if start_date > end_date:

            return Response(

                {
                    "error":
                        "Start date cannot be after end date."
                },

                status=400

            )


        # -------------------------------------------------
        # FINANCIAL DATA
        # -------------------------------------------------

        financial_data = (
            calculate_financial_data(

                user,

                start_date,

                end_date

            )
        )


        # -------------------------------------------------
        # EXPENSE DATA
        # -------------------------------------------------

        expenses = list(

            Expense.objects
            .filter(
                user=user,
                expense_date__range=[
                    start_date,
                    end_date
                ]
            )
            .values(
                "id",
                "title",
                "category",
                "amount",
                "expense_date",
                "description"
            )
            .order_by(
                "-expense_date",
                "-id"
            )

        )


        # -------------------------------------------------
        # EXPENSE CATEGORY ANALYTICS
        # -------------------------------------------------

        expense_by_category = list(

            Expense.objects
            .filter(
                user=user,
                expense_date__range=[
                    start_date,
                    end_date
                ]
            )
            .values(
                "category"
            )
            .annotate(
                total=Sum("amount")
            )
            .order_by(
                "-total"
            )

        )


        # -------------------------------------------------
        # SAVINGS GOALS
        # -------------------------------------------------

        goals = (

            SavingsGoal.objects
            .filter(
                user=user
            )
            .order_by(
                "deadline",
                "-id"
            )

        )


        savings_goals = []


        for goal in goals:

            target_amount = (
                goal.target_amount
            )

            saved_amount = (
                goal.saved_amount
            )


            remaining_amount = max(

                target_amount -
                saved_amount,

                Decimal("0.00")

            )


            if target_amount > 0:

                progress_percentage = (

                    saved_amount /
                    target_amount

                ) * Decimal("100")


                progress_percentage = min(

                    progress_percentage,

                    Decimal("100")

                )

            else:

                progress_percentage = (
                    Decimal("0.00")
                )


            status = (

                "COMPLETED"

                if saved_amount >= target_amount

                else "IN_PROGRESS"

            )


            savings_goals.append({

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
                        progress_percentage,
                        2
                    ),

                "status":
                    status,

                "deadline":
                    goal.deadline,

            })


        # -------------------------------------------------
        # FINAL COMBINED REPORT
        # -------------------------------------------------

        return Response({

            "report_type":
                "Financial Summary Report",

            "start_date":
                start_date,

            "end_date":
                end_date,


            "financial_summary": {

                "total_income":
                    financial_data[
                        "total_income"
                    ],

                "total_expense":
                    financial_data[
                        "total_expense"
                    ],

                "current_balance":
                    financial_data[
                        "current_balance"
                    ],

                "total_savings":
                    financial_data[
                        "total_savings"
                    ],

                "remaining_budget":
                    financial_data[
                        "remaining_budget"
                    ],

            },


            "expense_summary": {

                "expense_by_category":
                    expense_by_category,

                "total_expenses":
                    len(expenses),

                "expenses":
                    expenses,

            },


            "savings_summary": {

                "total_goals":
                    len(savings_goals),

                "goals":
                    savings_goals,

            },

        })


# =========================================================
# EXPORT FINANCIAL REPORT AS CSV
# =========================================================

class ExportFinancialReportView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user


        # -------------------------------------------------
        # DATE RANGE
        # -------------------------------------------------

        start_date, end_date = (
            get_requested_date_range(
                request
            )
        )


        if start_date is None:

            return Response(

                {
                    "error":
                        "Invalid date format. Use YYYY-MM-DD."
                },

                status=400

            )


        if start_date > end_date:

            return Response(

                {
                    "error":
                        "Start date cannot be after end date."
                },

                status=400

            )


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        response = HttpResponse(
            content_type="text/csv"
        )


        response[
            "Content-Disposition"
        ] = (
            'attachment; '
            'filename="budgetbuddy_financial_report.csv"'
        )


        writer = csv.writer(
            response
        )


        # =================================================
        # REPORT HEADER
        # =================================================

        writer.writerow([
            "BudgetBuddy Financial Report"
        ])

        writer.writerow([
            "Start Date",
            start_date
        ])

        writer.writerow([
            "End Date",
            end_date
        ])

        writer.writerow([])


        # =================================================
        # FINANCIAL SUMMARY
        # =================================================

        financial_data = (
            calculate_financial_data(

                user,

                start_date,

                end_date

            )
        )


        writer.writerow([
            "FINANCIAL SUMMARY"
        ])

        writer.writerow([
            "Total Income",
            financial_data[
                "total_income"
            ]
        ])

        writer.writerow([
            "Total Expense",
            financial_data[
                "total_expense"
            ]
        ])

        writer.writerow([
            "Current Balance",
            financial_data[
                "current_balance"
            ]
        ])

        writer.writerow([
            "Total Savings",
            financial_data[
                "total_savings"
            ]
        ])

        writer.writerow([
            "Total Budget",
            financial_data[
                "total_budget"
            ]
        ])

        writer.writerow([
            "Remaining Budget",
            financial_data[
                "remaining_budget"
            ]
        ])

        writer.writerow([])


        # =================================================
        # INCOME TRANSACTIONS
        # =================================================

        writer.writerow([
            "INCOME TRANSACTIONS"
        ])

        writer.writerow([

            "Title",
            "Source",
            "Amount",
            "Date",
            "Description"

        ])


        incomes = (

            Income.objects
            .filter(

                user=user,

                income_date__range=[
                    start_date,
                    end_date
                ]

            )
            .order_by(
                "income_date",
                "id"
            )

        )


        for income in incomes:

            writer.writerow([

                income.title,

                income.source,

                income.amount,

                income.income_date,

                income.description,

            ])


        writer.writerow([])


        # =================================================
        # EXPENSE TRANSACTIONS
        # =================================================

        writer.writerow([
            "EXPENSE TRANSACTIONS"
        ])

        writer.writerow([

            "Title",
            "Category",
            "Amount",
            "Date",
            "Description"

        ])


        expenses = (

            Expense.objects
            .filter(

                user=user,

                expense_date__range=[
                    start_date,
                    end_date
                ]

            )
            .order_by(
                "expense_date",
                "id"
            )

        )


        for expense in expenses:

            writer.writerow([

                expense.title,

                expense.category,

                expense.amount,

                expense.expense_date,

                expense.description,

            ])


        writer.writerow([])


        # =================================================
        # SAVINGS GOALS
        # =================================================

        writer.writerow([
            "SAVINGS GOALS"
        ])

        writer.writerow([

            "Goal Name",
            "Target Amount",
            "Saved Amount",
            "Remaining Amount",
            "Progress Percentage",
            "Status",
            "Deadline"

        ])


        goals = (

            SavingsGoal.objects
            .filter(
                user=user
            )
            .order_by(
                "deadline",
                "-id"
            )

        )


        for goal in goals:

            target_amount = (
                goal.target_amount
            )

            saved_amount = (
                goal.saved_amount
            )


            remaining_amount = max(

                target_amount -
                saved_amount,

                Decimal("0.00")

            )


            if target_amount > 0:

                progress_percentage = (

                    saved_amount /
                    target_amount

                ) * Decimal("100")


                progress_percentage = min(

                    progress_percentage,

                    Decimal("100")

                )

            else:

                progress_percentage = (
                    Decimal("0.00")
                )


            status = (

                "COMPLETED"

                if saved_amount >= target_amount

                else "IN_PROGRESS"

            )


            writer.writerow([

                goal.goal_name,

                target_amount,

                saved_amount,

                remaining_amount,

                round(
                    progress_percentage,
                    2
                ),

                status,

                goal.deadline,

            ])


        return response