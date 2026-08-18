from calendar import month_name
from datetime import date

from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


# =====================================================
# HELPER FUNCTION
# =====================================================

def get_financial_summary(user):

    total_income = (
        Income.objects
        .filter(user=user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_expense = (
        Expense.objects
        .filter(user=user)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_budget = (
        Budget.objects
        .filter(user=user)
        .aggregate(total=Sum("budget_amount"))["total"]
        or 0
    )

    total_savings = (
        SavingsGoal.objects
        .filter(user=user)
        .aggregate(total=Sum("saved_amount"))["total"]
        or 0
    )

    return {

        "total_income":
            total_income,

        "total_expense":
            total_expense,

        "current_balance":
            total_income - total_expense,

        "total_budget":
            total_budget,

        "total_savings":
            total_savings,

        "remaining_budget":
            total_budget - total_expense,

    }


# =====================================================
# FINANCIAL SUMMARY API
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def financial_summary(request):

    return Response(
        get_financial_summary(request.user)
    )


# =====================================================
# CATEGORY-WISE EXPENSE ANALYSIS
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def category_expense_analysis(request):

    category_data = (

        Expense.objects
        .filter(user=request.user)
        .values("category")
        .annotate(total=Sum("amount"))
        .order_by("-total")

    )

    return Response(list(category_data))


# =====================================================
# MONTHLY EXPENSE TREND
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_expense_trend(request):

    today = date.today()

    monthly_data = []

    # Last 6 months including current month
    for i in range(5, -1, -1):

        month = today.month - i
        year = today.year

        # Handle previous year
        while month <= 0:
            month += 12
            year -= 1

        # ---------------------------------------------
        # Income for this month
        # ---------------------------------------------

        total_income = (
            Income.objects.filter(
                user=request.user,
                income_date__month=month,
                income_date__year=year,
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # ---------------------------------------------
        # Expense for this month
        # ---------------------------------------------

        total_expense = (
            Expense.objects.filter(
                user=request.user,
                date__month=month,
                date__year=year,
            )
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # ---------------------------------------------
        # Balance
        # ---------------------------------------------

        balance = total_income - total_expense

        # ---------------------------------------------
        # Month name
        # ---------------------------------------------

        month_text = date(
            year,
            month,
            1
        ).strftime("%b")

        monthly_data.append({

            "month": month_text,

            "income": float(total_income),

            "expense": float(total_expense),

            "balance": float(balance),

        })

    return Response(monthly_data)


# =====================================================
# EXPENSE STATISTICS
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def expense_statistics(request):

    highest = (
        Expense.objects
        .filter(user=request.user)
        .order_by("-amount")
        .first()
    )

    lowest = (
        Expense.objects
        .filter(user=request.user)
        .order_by("amount")
        .first()
    )

    latest = (
        Expense.objects
        .filter(user=request.user)
        .order_by("-date")
        .first()
    )

    oldest = (
        Expense.objects
        .filter(user=request.user)
        .order_by("date")
        .first()
    )


    return Response({

        "highest_expense": {

            "title": highest.title,
            "amount": highest.amount,
            "category": highest.category,
            "date": highest.date,

        } if highest else None,


        "lowest_expense": {

            "title": lowest.title,
            "amount": lowest.amount,
            "category": lowest.category,
            "date": lowest.date,

        } if lowest else None,


        "latest_expense": {

            "title": latest.title,
            "amount": latest.amount,
            "category": latest.category,
            "date": latest.date,

        } if latest else None,


        "oldest_expense": {

            "title": oldest.title,
            "amount": oldest.amount,
            "category": oldest.category,
            "date": oldest.date,

        } if oldest else None,

    })


# =====================================================
# DASHBOARD API
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):

    user = request.user


    # =================================================
    # 1. FINANCIAL SUMMARY
    # =================================================

    summary = get_financial_summary(user)


    # =================================================
    # 2. EXPENSE CATEGORY ANALYSIS
    # =================================================

    category_analysis = (

        Expense.objects
        .filter(user=user)
        .values("category")
        .annotate(total=Sum("amount"))
        .order_by("-total")

    )


    # =================================================
    # 3. SIX-MONTH FINANCIAL TREND
    # =================================================

    today = date.today()

    monthly_trend = []


    for i in range(5, -1, -1):

        month = today.month - i
        year = today.year


        while month <= 0:

            month += 12
            year -= 1


        # ---------------------------------------------
        # Monthly Income
        # ---------------------------------------------

        monthly_income = (

            Income.objects
            .filter(
                user=user,
                income_date__month=month,
                income_date__year=year,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0

        )


        # ---------------------------------------------
        # Monthly Expense
        # ---------------------------------------------

        monthly_expense = (

            Expense.objects
            .filter(
                user=user,
                date__month=month,
                date__year=year,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0

        )


        # ---------------------------------------------
        # Monthly Balance
        # ---------------------------------------------

        monthly_balance = (
            monthly_income - monthly_expense
        )


        monthly_trend.append({

            "month":
                month_name[month],

            "year":
                year,

            "income":
                monthly_income,

            "expense":
                monthly_expense,

            "balance":
                monthly_balance,

        })


    # =================================================
    # 4. RECENT TRANSACTIONS
    # =================================================

    recent_transactions = (

        Expense.objects
        .filter(user=user)
        .order_by("-date", "-id")[:5]

    )


    # =================================================
    # 5. RECENT INCOME
    # =================================================

    recent_income = (

        Income.objects
        .filter(user=user)
        .order_by("-income_date", "-id")[:5]

    )


    # =================================================
    # 6. LATEST NOTIFICATIONS
    # =================================================

    latest_notifications = (

        Notification.objects
        .filter(user=user)
        .order_by("-created_at")[:5]

    )


    # =================================================
    # 7. SAVINGS GOALS
    # =================================================

    active_savings_goals = (

        SavingsGoal.objects
        .filter(user=user)
        .order_by("target_date")

    )


    # =================================================
    # 8. FINAL RESPONSE
    # =================================================

    return Response({

        # ---------------------------------------------
        # Financial Summary
        # ---------------------------------------------

        "financial_summary":
            summary,


        # ---------------------------------------------
        # Category Analysis
        # ---------------------------------------------

        "category_analysis": [

            {

                "category":
                    item["category"],

                "total":
                    item["total"],

            }

            for item in category_analysis

        ],


        # ---------------------------------------------
        # Monthly Trend
        # ---------------------------------------------

        "monthly_trend":
            monthly_trend,


        # ---------------------------------------------
        # Recent Income
        # ---------------------------------------------

        "recent_income": [

            {

                "id":
                    income.id,

                "title":
                    income.title,

                "source":
                    income.source,

                "amount":
                    income.amount,

                "income_date":
                    income.income_date,

            }

            for income in recent_income

        ],


        # ---------------------------------------------
        # Recent Expenses
        # ---------------------------------------------

        "recent_transactions": [

            {

                "id":
                    expense.id,

                "title":
                    expense.title,

                "category":
                    expense.category,

                "amount":
                    expense.amount,

                "date":
                    expense.date,

            }

            for expense in recent_transactions

        ],


        # ---------------------------------------------
        # Notifications
        # ---------------------------------------------

        "latest_notifications": [

            {

                "id":
                    notification.id,

                "title":
                    notification.title,

                "message":
                    notification.message,

                "priority":
                    notification.priority,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at,

            }

            for notification in latest_notifications

        ],


        # ---------------------------------------------
        # Savings Goals
        # ---------------------------------------------

        "active_savings_goals": [

            {

                "id":
                    goal.id,

                "goal_name":
                    goal.goal_name,

                "target_amount":
                    goal.target_amount,

                "saved_amount":
                    goal.saved_amount,

                "remaining_amount":
                    goal.remaining_amount,

                "progress_percentage":
                    goal.progress_percentage,

                "target_date":
                    goal.target_date,

            }

            for goal in active_savings_goals

        ],

    })