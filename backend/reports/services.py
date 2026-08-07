from datetime import date, datetime
from django.db.models import Sum
from django.utils import timezone

from budgets.models import Budget
from expenses.models import Expense
from income.models import Income
from savings.models import SavingsGoal
from notifications.models import Notification


def parse_date_filters(request):
    """
    Handles date filtering params:
    - month & year
    - start_date & end_date
    """
    month = request.query_params.get("month")
    year = request.query_params.get("year")
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    return {
        "month": int(month) if month and month.isdigit() else None,
        "year": int(year) if year and year.isdigit() else None,
        "start_date": start_date,
        "end_date": end_date,
        "all_time": request.query_params.get("all_time") == "true",
    }


def filter_transactions(queryset, date_field, month=None, year=None, start_date=None, end_date=None, all_time=False):
    if all_time:
        return queryset
    if start_date or end_date:
        date_lookup = f"{date_field}__date" if date_field == "created_at" else date_field
        if start_date:
            queryset = queryset.filter(**{f"{date_lookup}__gte": start_date})
        if end_date:
            queryset = queryset.filter(**{f"{date_lookup}__lte": end_date})
        return queryset

    if month:
        queryset = queryset.filter(**{f"{date_field}__month": month})
    if year:
        queryset = queryset.filter(**{f"{date_field}__year": year})
    return queryset


def get_financial_summary(user, month=None, year=None, start_date=None, end_date=None, all_time=False):
    now = timezone.now()
    target_month = month if month else now.month
    target_year = year if year else now.year

    income_qs = filter_transactions(
        Income.objects.filter(user=user), "income_date", month, year, start_date, end_date, all_time
    )
    expense_qs = filter_transactions(
        Expense.objects.filter(user=user), "expense_date", month, year, start_date, end_date, all_time
    )

    total_income = income_qs.aggregate(total=Sum("amount"))["total"] or 0.0
    total_expense = expense_qs.aggregate(total=Sum("amount"))["total"] or 0.0
    current_balance = float(total_income) - float(total_expense)

    user_budgets = Budget.objects.filter(user=user)
    if all_time:
        pass
    elif start_date or end_date:
        start_month = date.fromisoformat(start_date).replace(day=1) if start_date else None
        end_month = date.fromisoformat(end_date).replace(day=1) if end_date else None
        user_budgets = [
            budget for budget in user_budgets
            if (not start_month or date(budget.year, budget.month, 1) >= start_month)
            and (not end_month or date(budget.year, budget.month, 1) <= end_month)
        ]
    else:
        user_budgets = user_budgets.filter(month=target_month, year=target_year)
    total_budget_allocated = (
        sum(float(budget.budget_amount) for budget in user_budgets)
    )

    total_spent_on_budgeted_categories = 0.0
    for budget in user_budgets:
        budget_month = budget.month if not (start_date or end_date) else None
        budget_year = budget.year if not (start_date or end_date) else None
        # Use created_at for budget spend totals to match BudgetSerializer.get_spent
        spent = (
            filter_transactions(
                Expense.objects.filter(user=user, category=budget.category),
                "created_at",
                budget_month,
                budget_year,
                start_date,
                end_date,
                all_time,
            ).aggregate(total=Sum("amount"))["total"]
            or 0.0
        )
        total_spent_on_budgeted_categories += float(spent)

    remaining_budget = max(
        0.0, float(total_budget_allocated) - float(total_spent_on_budgeted_categories)
    )

    total_savings = (
        SavingsGoal.objects.filter(user=user).aggregate(total=Sum("saved_amount"))["total"]
        or 0.0
    )

    return {
        "month": target_month,
        "year": target_year,
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "current_balance": current_balance,
        "total_savings": float(total_savings),
        "remaining_budget": remaining_budget,
    }


def get_expense_report(user, month=None, year=None, start_date=None, end_date=None, all_time=False):
    expenses = filter_transactions(
        Expense.objects.filter(user=user), "expense_date", month, year, start_date, end_date, all_time
    )

    return [
        {
            "id": exp.id,
            "title": exp.title,
            "category": exp.category,
            "amount": float(exp.amount),
            "date": exp.expense_date.strftime("%Y-%m-%d") if getattr(exp, 'expense_date', None) else (exp.created_at.strftime("%Y-%m-%d") if exp.created_at else None),
            "description": getattr(exp, "description", ""),
        }
        for exp in expenses.order_by("-created_at")
    ]


def get_savings_report(user):
    goals = SavingsGoal.objects.filter(user=user)
    report = []

    for g in goals:
        target = float(g.target_amount)
        saved = float(g.saved_amount)
        remaining = max(0.0, target - saved)
        progress = (saved / target * 100) if target > 0 else 0.0

        days_remaining = max(0, (g.target_date - timezone.localdate()).days)
        report.append(
            {
                "id": g.id,
                "goal_name": g.goal_name,
                "target_amount": target,
                "saved_amount": saved,
                "remaining_amount": remaining,
                "progress_percentage": round(progress, 2),
                "status": g.status,
                "days_remaining": days_remaining,
                "target_date": g.target_date.strftime("%Y-%m-%d") if g.target_date else None,
            }
        )

    return report


def get_combined_financial_summary(user, month=None, year=None, start_date=None, end_date=None, all_time=False):
    now = timezone.now()
    m = month if month else now.month
    y = year if year else now.year

    fin_summary = get_financial_summary(user, month=month, year=year, start_date=start_date, end_date=end_date, all_time=all_time)
    expenses = get_expense_report(user, month, year, start_date, end_date, all_time)

    source_label_map = {
        'SALARY': 'Salary',
        'FREELANCING': 'Freelancing',
        'POCKET_MONEY': 'Pocket Money',
        'INVESTMENTS': 'Investments',
        'SCHOLARSHIP': 'Scholarship',
        'BUSINESS': 'Business',
        'OTHER': 'Other Sources',
    }

    incomes = [
        {
            "id": inc.id,
            "title": inc.title,
            "amount": float(inc.amount),
            "source": inc.source,
            "source_label": source_label_map.get(inc.source, inc.source),
            "income_date": inc.income_date.strftime("%Y-%m-%d") if inc.income_date else None,
            "description": inc.description,
        }
        for inc in filter_transactions(
            Income.objects.filter(user=user), "income_date", month, year, start_date, end_date, all_time
        ).order_by("-income_date")
    ]

    budgets = [
        {
            "id": b.id,
            "category": b.category,
            "budget_amount": float(b.budget_amount),
            "month": b.month,
            "year": b.year,
        }
        for b in Budget.objects.filter(user=user)
    ]

    savings = get_savings_report(user)

    notifications = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "priority": n.priority,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S") if n.created_at else None,
        }
        for n in Notification.objects.filter(user=user).order_by("-created_at")[:5]
    ]

    return {
        "financial_summary": fin_summary,
        "expense_summary": expenses,
        "income_summary": incomes,
        "budget_summary": budgets,
        "savings_summary": savings,
        "latest_notifications": notifications,
    }


def get_category_expense_analysis(user, month=None, year=None, start_date=None, end_date=None, all_time=False):
    data = (
        filter_transactions(
            Expense.objects.filter(user=user), "expense_date", month, year, start_date, end_date, all_time
        )
        .values("category")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    return {item["category"] or "Uncategorized": float(item["total"]) for item in data}


def get_monthly_expense_trend(user, month=None, year=None, start_date=None, end_date=None, all_time=False):
    from django.db.models.functions import TruncMonth

    data = (
        filter_transactions(
            Expense.objects.filter(user=user), "expense_date", month, year, start_date, end_date, all_time
        )
        .annotate(month=TruncMonth("expense_date"))
        .values("month")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )

    result = {}
    for item in data:
        if item["month"]:
            month_name = item["month"].strftime("%B")
            result[month_name] = float(item["total"])
    return result


def get_expense_extremes_and_bounds(user, month=None, year=None, start_date=None, end_date=None, all_time=False):
    expenses = filter_transactions(
        Expense.objects.filter(user=user),
            "expense_date",
        month,
        year,
        start_date,
        end_date,
        all_time,
    )
    if not expenses.exists():
        return {
            "highest_expense": None,
            "lowest_expense": None,
            "latest_expense": None,
            "oldest_expense": None,
        }

    highest = expenses.order_by("-amount").first()
    lowest = expenses.order_by("amount").first()
    latest = expenses.order_by("-expense_date").first()
    oldest = expenses.order_by("expense_date").first()

    def format_expense(exp):
        if not exp:
            return None
        return {
            "id": exp.id,
            "title": exp.title,
            "amount": float(exp.amount),
            "date": exp.expense_date.strftime("%Y-%m-%d") if getattr(exp, 'expense_date', None) else (exp.created_at.strftime("%Y-%m-%d") if exp.created_at else None),
        }

    return {
        "highest_expense": format_expense(highest),
        "lowest_expense": format_expense(lowest),
        "latest_expense": format_expense(latest),
        "oldest_expense": format_expense(oldest),
    }
