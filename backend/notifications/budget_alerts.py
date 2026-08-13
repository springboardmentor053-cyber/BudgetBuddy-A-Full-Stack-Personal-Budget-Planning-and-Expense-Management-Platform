from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Sum

from budgets.models import Budget
from notifications.models import Notification
from users.models import Expense


ALERT_TIERS = (
    (Decimal('100'), 'exceeded_100', 'HIGH'),
    (Decimal('90'), 'critical_90', 'HIGH'),
    (Decimal('80'), 'warning_80', 'MEDIUM'),
    (Decimal('75'), 'warning_75', 'LOW'),
)


def _tier_for(percentage):
    for minimum, level, priority in ALERT_TIERS:
        if percentage >= minimum:
            return minimum, level, priority
    return None


def evaluate_expense_budget_alert(expense, previous_expense=None):
    """Create an alert when the expense enters a higher budget tier."""
    budget_amount = Budget.objects.filter(user=expense.user, category__iexact=expense.category,
        month=expense.expense_date.month, year=expense.expense_date.year).aggregate(total=Sum('budget_amount'))['total']
    if not budget_amount or budget_amount <= 0:
        return None
    spent_amount = Expense.objects.filter(user=expense.user, category__iexact=expense.category,
        expense_date__month=expense.expense_date.month, expense_date__year=expense.expense_date.year).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    percentage = (spent_amount / budget_amount) * Decimal('100')
    current_tier = _tier_for(percentage)
    if current_tier is None:
        return None
    previous_percentage = Decimal('0')
    if previous_expense and (previous_expense.category.upper() == expense.category.upper()
        and previous_expense.expense_date.month == expense.expense_date.month
        and previous_expense.expense_date.year == expense.expense_date.year):
        previous_percentage = ((spent_amount - previous_expense.amount) / budget_amount) * Decimal('100')
    previous_tier = _tier_for(previous_percentage)
    if previous_tier and previous_tier[0] >= current_tier[0]:
        return None
    displayed_percentage = percentage.quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
    over_amount = max(Decimal('0'), spent_amount - budget_amount)
    _, level, priority = current_tier
    if level == 'exceeded_100':
        title = 'Budget Exceeded!'
        message = f'Budget Exceeded! You have spent ₹{spent_amount:.2f} on {expense.category}, exceeding your budget of ₹{budget_amount:.2f} by ₹{over_amount:.2f}.'
    else:
        threshold = {'warning_75': '75', 'warning_80': '80', 'critical_90': '90'}[level]
        title = 'Critical Budget Alert (90%)' if level == 'critical_90' else f'Budget Warning ({threshold}%)'
        message = f'{title}: You have spent ₹{spent_amount:.2f} ({displayed_percentage}%) of your ₹{budget_amount:.2f} budget for {expense.category}.'
    Notification.objects.create(user=expense.user, title=title, message=message,
        notification_type='BUDGET_ALERT', priority=priority)
    return {'triggered': True, 'level': level, 'percentage': float(displayed_percentage),
        'category': expense.category, 'message': message}
