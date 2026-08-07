from django.db.models import Sum
from .models import Budget
from expenses.models import Expense


def calculate_budget_utilization(user, category, month, year):
    """
    Recalculates budget utilization percentage for a given category and month/year.
    Returns (budget_obj, total_expense, utilization_percentage).
    """
    budget = Budget.objects.filter(
        user=user,
        category=category,
        month=month,
        year=year
    ).first()

    if not budget or budget.monthly_limit == 0:
        return None, 0, 0.0

    total_expense = Expense.objects.filter(
        user=user,
        category=category,
        expense_date__month=month,
        expense_date__year=year
    ).aggregate(total=Sum("amount"))["total"] or 0

    utilization = (float(total_expense) / float(budget.monthly_limit)) * 100

    return budget, total_expense, utilization
