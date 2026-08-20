from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Sum
from django.apps import apps
from datetime import datetime, date, timedelta
import calendar

from budgets.models import Budget
from income.models import Income
from savings.models import SavingsGoal
from users.models import Expense


def get_model_safely(model_name):
    """Safely retrieves a model at runtime across all loaded apps."""
    for app_config in apps.get_app_configs():
        try:
            return apps.get_model(app_config.label, model_name)
        except LookupError:
            continue
    return None


def get_date_field_name(model):
    """Detects the primary date/datetime field name dynamically."""
    if not model:
        return 'date'
    field_names = [f.name for f in model._meta.get_fields()]
    for candidate in ['date', 'expense_date', 'income_date', 'start_date', 'created_at']:
        if candidate in field_names:
            return candidate
    return 'date'


def get_amount_field_name(model):
    """Detects amount field name dynamically."""
    if not model:
        return 'amount'
    field_names = [f.name for f in model._meta.get_fields()]
    for candidate in ['amount', 'monthly_budget_amount', 'limit', 'target_amount']:
        if candidate in field_names:
            return candidate
    return 'amount'


def resolve_date_range(request):
    """Helper function to parse date filters (current_month, previous_month, custom)."""
    today = date.today()
    filter_type = request.query_params.get('filter', '').lower()
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    if filter_type == 'current_month':
        start_date = date(today.year, today.month, 1)
        last_day = calendar.monthrange(today.year, today.month)[1]
        end_date = date(today.year, today.month, last_day)
    elif filter_type == 'previous_month':
        first_of_this_month = date(today.year, today.month, 1)
        last_of_prev_month = first_of_this_month - timedelta(days=1)
        start_date = date(last_of_prev_month.year, last_of_prev_month.month, 1)
        end_date = last_of_prev_month
    elif start_date_str and end_date_str:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    else:
        start_date = date(today.year, today.month, 1)
        last_day = calendar.monthrange(today.year, today.month)[1]
        end_date = date(today.year, today.month, last_day)

    return start_date, end_date


def budget_period_filter(start_date, end_date):
    """Return a query covering every budget month touched by a date range."""
    month_cursor = date(start_date.year, start_date.month, 1)
    last_month = date(end_date.year, end_date.month, 1)
    query = Q()
    while month_cursor <= last_month:
        query |= Q(month=month_cursor.month, year=month_cursor.year)
        month_cursor = (
            date(month_cursor.year + 1, 1, 1)
            if month_cursor.month == 12
            else date(month_cursor.year, month_cursor.month + 1, 1)
        )
    return query


# --- TASK 2: Monthly Financial Report API ---
class MonthlyFinancialReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = datetime.now()
        try:
            year = int(request.query_params.get('year', now.year))
            month = int(request.query_params.get('month', now.month))
            date(year, month, 1)
        except (TypeError, ValueError):
            return Response({"error": "year and month must identify a valid month."}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user

        # 1. Total Income
        res_income = Income.objects.filter(user=user, income_date__year=year, income_date__month=month).aggregate(total=Sum('amount'))['total']
        total_income = float(res_income) if res_income is not None else 0.0

        # 2. Total Expense
        res_expense = Expense.objects.filter(user=user, expense_date__year=year, expense_date__month=month).aggregate(total=Sum('amount'))['total']
        total_expense = float(res_expense) if res_expense is not None else 0.0

        # 3. Current Balance
        current_balance = total_income - total_expense

        # 4. Total Savings
        res_all_inc = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total']
        res_all_exp = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total']
        all_time_income = float(res_all_inc) if res_all_inc is not None else 0.0
        all_time_expense = float(res_all_exp) if res_all_exp is not None else 0.0
        total_savings = all_time_income - all_time_expense

        # 5. Remaining Budget
        total_budget_limit = 0.0
        res_budget = Budget.objects.filter(user=user, month=month, year=year).aggregate(total=Sum('budget_amount'))['total']
        total_budget_limit = float(res_budget) if res_budget is not None else 0.0

        remaining_budget = total_budget_limit - total_expense

        return Response({
            "year": year,
            "month": month,
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "current_balance": round(current_balance, 2),
            "total_savings": round(total_savings, 2),
            "remaining_budget": round(remaining_budget, 2),
        }, status=status.HTTP_200_OK)


# --- TASK 3: Expense Report API ---
class ExpenseReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        Expense = get_model_safely('Expense')
        user = request.user
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {"error": "Please provide both 'start_date' and 'end_date' query parameters (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Expense:
            return Response({"start_date": start_date, "end_date": end_date, "total_count": 0, "expenses": []}, status=status.HTTP_200_OK)

        exp_date = get_date_field_name(Expense)
        exp_amt = get_amount_field_name(Expense)
        range_filter = {'user': user, f'{exp_date}__range': [start_date, end_date]}

        expenses = Expense.objects.filter(**range_filter).order_by(f'-{exp_date}')

        report_data = []
        for expense in expenses:
            category_val = getattr(expense, 'category', '')
            category_str = category_val.name if hasattr(category_val, 'name') else str(category_val)
            date_val = getattr(expense, exp_date, '')
            amt_val = getattr(expense, exp_amt, 0.0)

            report_data.append({
                "id": expense.id,
                "title": getattr(expense, 'title', getattr(expense, 'name', '')),
                "category": category_str,
                "amount": float(amt_val),
                "date": str(date_val),
                "description": getattr(expense, 'description', '')
            })

        return Response({
            "start_date": start_date,
            "end_date": end_date,
            "total_count": len(report_data),
            "expenses": report_data
        }, status=status.HTTP_200_OK)


# --- TASK 4: Savings Report API ---
class SavingsReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        SavingsGoal = get_model_safely('SavingsGoal') or get_model_safely('Savings')
        user = request.user

        if not SavingsGoal:
            return Response({"total_goals": 0, "savings_goals": []}, status=status.HTTP_200_OK)

        goals = SavingsGoal.objects.filter(user=user)

        report_data = []
        for goal in goals:
            target = float(getattr(goal, 'target_amount', getattr(goal, 'target', 0.0)))
            saved = float(getattr(goal, 'saved_amount', getattr(goal, 'current_amount', 0.0)))

            remaining = max(0.0, target - saved)
            progress_pct = round((saved / target * 100), 2) if target > 0 else 0.0

            if hasattr(goal, 'status'):
                status_val = goal.status
            else:
                status_val = "COMPLETED" if saved >= target else "IN_PROGRESS"

            report_data.append({
                "id": goal.id,
                "goal_name": getattr(goal, 'name', getattr(goal, 'title', getattr(goal, 'goal_name', ''))),
                "target_amount": target,
                "saved_amount": saved,
                "remaining_amount": remaining,
                "progress_percentage": progress_pct,
                "status": status_val
            })

        return Response({
            "total_goals": len(report_data),
            "savings_goals": report_data
        }, status=status.HTTP_200_OK)


# --- TASK 5 & 6: Combined Financial Summary Report API ---
class FinancialSummaryReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            start_date, end_date = resolve_date_range(request)
        except ValueError:
            return Response(
                {"error": "Dates must use YYYY-MM-DD and form a valid range."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if start_date > end_date:
            return Response(
                {"error": "start_date must be on or before end_date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from notifications.models import Notification

        # 1. Income Summary
        income_list = []
        total_income = 0.0
        inc_qs = Income.objects.filter(user=user, income_date__range=[start_date, end_date])
        total_income = float(inc_qs.aggregate(total=Sum('amount'))['total'] or 0)
        for inc in inc_qs.order_by('-income_date', '-created_at', '-id')[:10]:
            income_list.append({
                "id": inc.id,
                "title": inc.title,
                "amount": float(inc.amount),
                "date": str(inc.income_date),
            })

        # 2. Expense Summary
        expense_list = []
        total_expense = 0.0
        exp_qs = Expense.objects.filter(user=user, expense_date__range=[start_date, end_date])
        total_expense = float(exp_qs.aggregate(total=Sum('amount'))['total'] or 0)
        for exp in exp_qs.order_by('-expense_date', '-created_at', '-id')[:10]:
            expense_list.append({
                "id": exp.id,
                "title": exp.title,
                "category": exp.category,
                "amount": float(exp.amount),
                "date": str(exp.expense_date),
            })

        # 3. Overall Financial Summary
        current_balance = total_income - total_expense
        all_inc = float(Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0)
        all_exp = float(Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0)
        total_savings_val = all_inc - all_exp

        # 4. Budget Summary
        total_budget = 0.0
        total_budget = float(
            Budget.objects.filter(user=user).filter(budget_period_filter(start_date, end_date))
            .aggregate(total=Sum('budget_amount'))['total'] or 0
        )

        remaining_budget = total_budget - total_expense

        # 5. Savings Summary
        savings_list = []
        for g in SavingsGoal.objects.filter(user=user):
            target = float(g.target_amount)
            saved = float(g.saved_amount)
            savings_list.append({
                "id": g.id,
                "goal_name": g.title,
                "target_amount": target,
                "saved_amount": saved,
                "remaining_amount": max(0.0, target - saved),
                "progress_percentage": round((saved / target * 100), 2) if target > 0 else 0.0,
            })

        # 6. Latest Notifications
        notifications_list = []
        if Notification:
            notifs = Notification.objects.filter(user=user).order_by('-id')[:5]
            for n in notifs:
                notifications_list.append({
                    "id": n.id,
                    "message": getattr(n, 'message', getattr(n, 'title', str(n))),
                    "is_read": getattr(n, 'is_read', False),
                    "created_at": str(getattr(n, 'created_at', ''))
                })

        return Response({
            "filter_applied": {
                "start_date": str(start_date),
                "end_date": str(end_date)
            },
            "financial_summary": {
                "total_income": round(total_income, 2),
                "total_expense": round(total_expense, 2),
                "current_balance": round(current_balance, 2),
                "total_savings": round(total_savings_val, 2),
                "remaining_budget": round(remaining_budget, 2)
            },
            "income_summary": {
                "count": len(income_list),
                "total_amount": round(total_income, 2),
                "items": income_list
            },
            "expense_summary": {
                "count": len(expense_list),
                "total_amount": round(total_expense, 2),
                "items": expense_list
            },
            "budget_summary": {
                "total_budget": round(total_budget, 2),
                "spent": round(total_expense, 2),
                "remaining_budget": round(remaining_budget, 2)
            },
            "savings_summary": {
                "total_goals": len(savings_list),
                "goals": savings_list
            },
            "latest_notifications": notifications_list
        }, status=status.HTTP_200_OK)
