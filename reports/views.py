from calendar import month_name

from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date, timedelta

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_report(request):

    month = request.query_params.get("month")
    year = request.query_params.get("year")

    if not month or not year:
        return Response(
            {"error": "Please provide month and year."},
            status=400
        )

    month = int(month)
    year = int(year)

    month_name_text = month_name[month]

    total_income = (
        Income.objects.filter(
            user=request.user,
            income_date__month=month,
            income_date__year=year,
        ).aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_expense = (
        Expense.objects.filter(
            user=request.user,
            date__month=month,
            date__year=year,
        ).aggregate(total=Sum("amount"))["total"]
        or 0
    )

    total_budget = (
        Budget.objects.filter(
            user=request.user,
            month=month_name_text,
            year=year,
        ).aggregate(total=Sum("budget_amount"))["total"]
        or 0
    )

    total_savings = (
        SavingsGoal.objects.filter(
            user=request.user
        ).aggregate(total=Sum("saved_amount"))["total"]
        or 0
    )

    return Response({
        "month": month_name_text,
        "year": year,
        "total_income": total_income,
        "total_expense": total_expense,
        "current_balance": total_income - total_expense,
        "total_savings": total_savings,
        "remaining_budget": total_budget - total_expense,
    })
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def expense_report(request):

    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    expenses = Expense.objects.filter(
        user=request.user
    )

    if start_date and end_date:
        expenses = expenses.filter(
            date__range=[start_date, end_date]
        )

    report = [
        {
            "title": expense.title,
            "category": expense.category,
            "amount": expense.amount,
            "date": expense.date,
        }
        for expense in expenses.order_by("-date")
    ]

    return Response(report)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def savings_report(request):

    savings = SavingsGoal.objects.filter(
        user=request.user
    )

    report = []

    for goal in savings:

        status = (
            "Completed"
            if goal.saved_amount >= goal.target_amount
            else "In Progress"
        )

        report.append({

            "goal_name": goal.goal_name,

            "target_amount": goal.target_amount,

            "saved_amount": goal.saved_amount,

            "remaining_amount": goal.remaining_amount,

            "progress_percentage": goal.progress_percentage,

            "status": status,

            "target_date": goal.target_date,

        })

    return Response(report)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def financial_summary_report(request):

    filter_type = request.query_params.get("filter")
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    today = date.today()

    # Base Querysets
    income_queryset = Income.objects.filter(user=request.user)
    expense_queryset = Expense.objects.filter(user=request.user)

    # Date Filters
    if filter_type == "current_month":

        income_queryset = income_queryset.filter(
            income_date__month=today.month,
            income_date__year=today.year,
        )

        expense_queryset = expense_queryset.filter(
            date__month=today.month,
            date__year=today.year,
        )

    elif filter_type == "previous_month":

        previous_month = today.month - 1
        previous_year = today.year

        if previous_month == 0:
            previous_month = 12
            previous_year -= 1

        income_queryset = income_queryset.filter(
            income_date__month=previous_month,
            income_date__year=previous_year,
        )

        expense_queryset = expense_queryset.filter(
            date__month=previous_month,
            date__year=previous_year,
        )

    elif start_date and end_date:

        income_queryset = income_queryset.filter(
            income_date__range=[start_date, end_date]
        )

        expense_queryset = expense_queryset.filter(
            date__range=[start_date, end_date]
        )

    # Financial Summary
    total_income = (
        income_queryset.aggregate(total=Sum("amount"))["total"] or 0
    )

    total_expense = (
        expense_queryset.aggregate(total=Sum("amount"))["total"] or 0
    )

    total_budget = (
        Budget.objects.filter(user=request.user)
        .aggregate(total=Sum("budget_amount"))["total"] or 0
    )

    total_savings = (
        SavingsGoal.objects.filter(user=request.user)
        .aggregate(total=Sum("saved_amount"))["total"] or 0
    )

    financial_summary = {
    "total_income": total_income,
    "total_expense": total_expense,
    "total_budget": total_budget,
    "current_balance": total_income - total_expense,
    "remaining_budget": total_budget - total_expense,
    "total_savings": total_savings,
}

    # Expense Summary
    expense_summary = list(
        expense_queryset.values(
            "title",
            "category",
            "amount",
            "date",
        )
    )

    # Income Summary
    income_summary = list(
        income_queryset.values(
            "title",
            "source",
            "amount",
            "income_date",
        )
    )

    # Budget Summary
    budget_summary = list(
        Budget.objects.filter(user=request.user).values(
            "category",
            "budget_amount",
            "month",
            "year",
        )
    )

    # Savings Summary
    savings_summary = [
        {
            "goal_name": goal.goal_name,
            "target_amount": goal.target_amount,
            "saved_amount": goal.saved_amount,
            "remaining_amount": goal.remaining_amount,
            "progress_percentage": goal.progress_percentage,
        }
        for goal in SavingsGoal.objects.filter(user=request.user)
    ]

    # Latest Notifications
    latest_notifications = list(
        Notification.objects.filter(user=request.user)
        .order_by("-created_at")[:5]
        .values(
            "title",
            "message",
            "priority",
            "created_at",
        )
    )

    return Response({

        "financial_summary": financial_summary,

        "expense_summary": expense_summary,

        "income_summary": income_summary,

        "budget_summary": budget_summary,

        "savings_summary": savings_summary,

        "latest_notifications": latest_notifications,

    })
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_report(request):

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

    total_savings = (
        SavingsGoal.objects.filter(user=request.user)
        .aggregate(total=Sum("saved_amount"))["total"] or 0
    )

    return Response({

        "report_info": {

            "generated_by": request.user.username,

            "generated_date": date.today(),

        },

        "financial_summary": {

            "total_income": total_income,

            "total_expense": total_expense,

            "current_balance": total_income - total_expense,

            "remaining_budget": total_budget - total_expense,

            "total_savings": total_savings,

        },

        "expenses": list(

            Expense.objects.filter(user=request.user).values(

                "title",

                "category",

                "amount",

                "date",

            )

        ),

        "income": list(

            Income.objects.filter(user=request.user).values(

                "title",

                "source",

                "amount",

                "income_date",

            )

        ),

        "budgets": list(

            Budget.objects.filter(user=request.user).values(

                "category",

                "budget_amount",

                "month",

                "year",

            )

        ),

        "savings": list(

            SavingsGoal.objects.filter(user=request.user).values(

                "goal_name",

                "target_amount",

                "saved_amount",

                "target_date",

            )

        ),

    })