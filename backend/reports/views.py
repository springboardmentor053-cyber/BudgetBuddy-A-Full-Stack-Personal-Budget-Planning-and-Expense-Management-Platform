from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum
from django.apps import apps
from datetime import datetime, date, timedelta
import calendar


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


# --- TASK 2: Monthly Financial Report API ---
class MonthlyFinancialReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        Income = get_model_safely('Income')
        Expense = get_model_safely('Expense')
        Budget = get_model_safely('Budget')

        now = datetime.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))
        user = request.user

        # 1. Total Income
        inc_date = get_date_field_name(Income)
        inc_amt = get_amount_field_name(Income)
        inc_filter = {'user': user, f'{inc_date}__year': year, f'{inc_date}__month': month} if inc_date else {'user': user}
        res_income = Income.objects.filter(**inc_filter).aggregate(total=Sum(inc_amt))['total'] if Income else None
        total_income = float(res_income) if res_income is not None else 0.0

        # 2. Total Expense
        exp_date = get_date_field_name(Expense)
        exp_amt = get_amount_field_name(Expense)
        exp_filter = {'user': user, f'{exp_date}__year': year, f'{exp_date}__month': month} if exp_date else {'user': user}
        res_expense = Expense.objects.filter(**exp_filter).aggregate(total=Sum(exp_amt))['total'] if Expense else None
        total_expense = float(res_expense) if res_expense is not None else 0.0

        # 3. Current Balance
        current_balance = total_income - total_expense

        # 4. Total Savings
        res_all_inc = Income.objects.filter(user=user).aggregate(total=Sum(inc_amt))['total'] if Income else None
        res_all_exp = Expense.objects.filter(user=user).aggregate(total=Sum(exp_amt))['total'] if Expense else None
        all_time_income = float(res_all_inc) if res_all_inc is not None else 0.0
        all_time_expense = float(res_all_exp) if res_all_exp is not None else 0.0
        total_savings = all_time_income - all_time_expense

        # 5. Remaining Budget
        total_budget_limit = 0.0
        if Budget:
            budget_fields = [f.name for f in Budget._meta.get_fields()]
            budget_amt = get_amount_field_name(Budget)
            budget_filter = {'user': user}

            if 'month' in budget_fields and 'year' in budget_fields:
                budget_filter['month'] = month
                budget_filter['year'] = year
            elif 'start_date' in budget_fields and 'end_date' in budget_fields:
                last_day = calendar.monthrange(year, month)[1]
                budget_filter['start_date__lte'] = f"{year}-{month:02d}-{last_day}"
                budget_filter['end_date__gte'] = f"{year}-{month:02d}-01"
            else:
                b_date = get_date_field_name(Budget)
                if b_date:
                    budget_filter[f'{b_date}__year'] = year
                    budget_filter[f'{b_date}__month'] = month

            res_budget = Budget.objects.filter(**budget_filter).aggregate(total=Sum(budget_amt))['total']
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
        start_date, end_date = resolve_date_range(request)

        Income = get_model_safely('Income')
        Expense = get_model_safely('Expense')
        Budget = get_model_safely('Budget')
        SavingsGoal = get_model_safely('SavingsGoal') or get_model_safely('Savings')
        Notification = get_model_safely('Notification') or get_model_safely('UserNotification')

        # 1. Income Summary
        income_list = []
        total_income = 0.0
        if Income:
            inc_date = get_date_field_name(Income)
            inc_amt = get_amount_field_name(Income)
            inc_qs = Income.objects.filter(user=user, **{f'{inc_date}__range': [start_date, end_date]})
            res_inc = inc_qs.aggregate(total=Sum(inc_amt))['total']
            total_income = float(res_inc) if res_inc is not None else 0.0

            for inc in inc_qs[:10]:
                income_list.append({
                    "id": inc.id,
                    "title": getattr(inc, 'source', getattr(inc, 'title', getattr(inc, 'name', 'Income'))),
                    "amount": float(getattr(inc, inc_amt, 0.0)),
                    "date": str(getattr(inc, inc_date, ''))
                })

        # 2. Expense Summary
        expense_list = []
        total_expense = 0.0
        if Expense:
            exp_date = get_date_field_name(Expense)
            exp_amt = get_amount_field_name(Expense)
            exp_qs = Expense.objects.filter(user=user, **{f'{exp_date}__range': [start_date, end_date]})
            res_exp = exp_qs.aggregate(total=Sum(exp_amt))['total']
            total_expense = float(res_exp) if res_exp is not None else 0.0

            for exp in exp_qs[:10]:
                cat = getattr(exp, 'category', '')
                expense_list.append({
                    "id": exp.id,
                    "title": getattr(exp, 'title', getattr(exp, 'name', 'Expense')),
                    "category": cat.name if hasattr(cat, 'name') else str(cat),
                    "amount": float(getattr(exp, exp_amt, 0.0)),
                    "date": str(getattr(exp, exp_date, ''))
                })

        # 3. Overall Financial Summary
        current_balance = total_income - total_expense
        all_inc = float(Income.objects.filter(user=user).aggregate(total=Sum(get_amount_field_name(Income)))['total'] or 0.0) if Income else 0.0
        all_exp = float(Expense.objects.filter(user=user).aggregate(total=Sum(get_amount_field_name(Expense)))['total'] or 0.0) if Expense else 0.0
        total_savings_val = all_inc - all_exp

        # 4. Budget Summary
        total_budget = 0.0
        if Budget:
            b_amt = get_amount_field_name(Budget)
            b_fields = [f.name for f in Budget._meta.get_fields()]
            b_filter = {'user': user}
            if 'month' in b_fields and 'year' in b_fields:
                b_filter['month'] = start_date.month
                b_filter['year'] = start_date.year
            elif 'start_date' in b_fields:
                b_filter['start_date__lte'] = end_date
                b_filter['end_date__gte'] = start_date

            res_b = Budget.objects.filter(**b_filter).aggregate(total=Sum(b_amt))['total']
            total_budget = float(res_b) if res_b is not None else 0.0

        remaining_budget = total_budget - total_expense

        # 5. Savings Summary
        savings_list = []
        if SavingsGoal:
            goals = SavingsGoal.objects.filter(user=user)
            for g in goals:
                t_amt = float(getattr(g, 'target_amount', getattr(g, 'target', 0.0)))
                s_amt = float(getattr(g, 'saved_amount', getattr(g, 'current_amount', 0.0)))
                pct = round((s_amt / t_amt * 100), 2) if t_amt > 0 else 0.0
                savings_list.append({
                    "id": g.id,
                    "goal_name": getattr(g, 'name', getattr(g, 'title', 'Savings Goal')),
                    "target_amount": t_amt,
                    "saved_amount": s_amt,
                    "remaining_amount": max(0.0, t_amt - s_amt),
                    "progress_percentage": pct
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