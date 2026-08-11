import calendar
from decimal import Decimal

from django.db.models import Q, Sum

from budgets.models import Budget
from expenses.models import Expense

from .models import Notification


def check_budget_alert(user, category, expense_date):
    """
    Check the user's budget utilization after an expense
    is created, updated, or deleted.

    Thresholds:
    80%  -> Budget Warning
    90%  -> High Warning
    100% -> Budget Limit
    >100% -> Overspending
    """

    if not user or not category or not expense_date:
        return

    month_name = calendar.month_name[expense_date.month]
    year = expense_date.year

    budgets = Budget.objects.filter(
        user=user,
        category=category,
    ).filter(
        Q(month__iexact=month_name)
        | Q(month__iexact=f"{month_name} {year}")
    )

    total_budget = (
        budgets.aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    if total_budget <= 0:
        return

    total_spent = (
        Expense.objects.filter(
            user=user,
            category=category,
            date__month=expense_date.month,
            date__year=year,
        ).aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    percentage_used = (
        total_spent / total_budget
    ) * Decimal("100")

    notification_title = (
        f"{category} Budget - {month_name} {year}"
    )

    # ==========================================
    # 100% OR MORE → BUDGET EXCEEDED
    # ==========================================

    if percentage_used >= 100:

        Notification.objects.get_or_create(
            user=user,
            notification_type="OVERSPENDING",
            title=notification_title,
            defaults={
                "message": (
                    f"Your {category} Budget has been exceeded. "
                    f"Budget: ₹{total_budget}, "
                    f"Spent: ₹{total_spent}."
                ),
                "priority": "HIGH",
            },
        )

    # ==========================================
    # 90% OR MORE → HIGH WARNING
    # ==========================================

    elif percentage_used >= 90:

        Notification.objects.get_or_create(
            user=user,
            notification_type="BUDGET_HIGH_WARNING",
            title=notification_title,
            defaults={
                "message": (
                    f"You have used "
                    f"{round(float(percentage_used), 2)}% "
                    f"of your monthly {category} Budget."
                ),
                "priority": "HIGH",
            },
        )

    # ==========================================
    # 80% OR MORE → WARNING
    # ==========================================

    elif percentage_used >= 80:

        Notification.objects.get_or_create(
            user=user,
            notification_type="BUDGET_WARNING",
            title=notification_title,
            defaults={
                "message": (
                    f"You have used "
                    f"{round(float(percentage_used), 2)}% "
                    f"of your monthly {category} Budget."
                ),
                "priority": "MEDIUM",
            },
        )

def check_savings_goal_alert(savings_goal):
    """
    Create savings-goal notifications when the user reaches:
    - 50%
    - 75%
    - 100%
    """

    if savings_goal.target_amount <= 0:
        return

    percentage = (
        savings_goal.saved_amount
        / savings_goal.target_amount
    ) * Decimal("100")

    user = savings_goal.user
    goal_title = savings_goal.title

    # ---------------------------------
    # GOAL COMPLETED: 100%
    # ---------------------------------

    if percentage >= 100:

        Notification.objects.get_or_create(
            user=user,
            notification_type="GOAL_COMPLETED",
            title=f"Goal Completed - {goal_title}",
            defaults={
                "message": (
                    f"Congratulations! You completed your "
                    f"'{goal_title}' savings goal."
                ),
                "priority": "HIGH",
            },
        )

    # ---------------------------------
    # 75% MILESTONE
    # ---------------------------------

    elif percentage >= 75:

        Notification.objects.get_or_create(
            user=user,
            notification_type="GOAL_MILESTONE",
            title=f"75% Milestone - {goal_title}",
            defaults={
                "message": (
                    f"You have completed 75% of your "
                    f"'{goal_title}' savings goal."
                ),
                "priority": "MEDIUM",
            },
        )

    # ---------------------------------
    # 50% MILESTONE
    # ---------------------------------

    elif percentage >= 50:

        Notification.objects.get_or_create(
            user=user,
            notification_type="GOAL_MILESTONE",
            title=f"50% Milestone - {goal_title}",
            defaults={
                "message": (
                    f"You are halfway towards your "
                    f"'{goal_title}' savings goal."
                ),
                "priority": "MEDIUM",
            },
        )