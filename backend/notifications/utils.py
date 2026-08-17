import calendar
import logging
from decimal import Decimal

from django.db.models import Q, Sum

from budgets.models import Budget
from expenses.models import Expense

from .email_utils import send_notification_email
from .models import Notification


logger = logging.getLogger(__name__)


def create_notification_and_email(
    *,
    user,
    notification_type,
    title,
    message,
    priority,
    deduplicate=False,
):
    """Create an in-app notification, then best-effort send its matching email."""

    if deduplicate:
        notification, created = Notification.objects.get_or_create(
            user=user,
            notification_type=notification_type,
            title=title,
            defaults={
                "message": message,
                "priority": priority,
            },
        )
    else:
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
        )
        created = True

    if created:
        try:
            send_notification_email(
                user=user,
                title=notification.title,
                message=notification.message,
            )
        except Exception:
            # Protect the main operation even if the email helper changes.
            logger.exception(
                "Unexpected notification email failure for notification %s.",
                notification.pk,
            )

    return notification


def check_budget_alert(user, category, expense_date):
    """Create threshold notifications after an expense changes."""

    if not user or not category or not expense_date:
        return

    month_name = calendar.month_name[expense_date.month]
    year = expense_date.year
    budgets = Budget.objects.filter(user=user, category=category).filter(
        Q(month__iexact=month_name) | Q(month__iexact=f"{month_name} {year}")
    )
    total_budget = budgets.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
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
    percentage_used = (total_spent / total_budget) * Decimal("100")
    percentage_text = round(float(percentage_used), 2)
    notification_title = f"{category} Budget - {month_name} {year}"
    details = (
        f"Budget: ₹{total_budget}. Spent: ₹{total_spent}. "
        f"Usage: {percentage_text}%."
    )

    if percentage_used >= 100:
        create_notification_and_email(
            user=user,
            notification_type="OVERSPENDING",
            title=notification_title,
            message=f"Your {category} budget has been exceeded. {details}",
            priority="HIGH",
            deduplicate=True,
        )
    elif percentage_used >= 90:
        create_notification_and_email(
            user=user,
            notification_type="BUDGET_HIGH_WARNING",
            title=notification_title,
            message=f"High budget warning for {category}. {details}",
            priority="HIGH",
            deduplicate=True,
        )
    elif percentage_used >= 80:
        create_notification_and_email(
            user=user,
            notification_type="BUDGET_WARNING",
            title=notification_title,
            message=f"Budget warning for {category}. {details}",
            priority="MEDIUM",
            deduplicate=True,
        )


def check_savings_goal_alert(savings_goal):
    """Create de-duplicated savings milestone and completion notifications."""

    if savings_goal.target_amount <= 0:
        return

    percentage = (savings_goal.saved_amount / savings_goal.target_amount) * Decimal("100")
    user = savings_goal.user
    goal_title = savings_goal.title

    if percentage >= 100:
        create_notification_and_email(
            user=user,
            notification_type="GOAL_COMPLETED",
            title=f"Goal Completed - {goal_title}",
            message=f"Congratulations! You completed your '{goal_title}' savings goal.",
            priority="HIGH",
            deduplicate=True,
        )
    elif percentage >= 75:
        create_notification_and_email(
            user=user,
            notification_type="GOAL_MILESTONE",
            title=f"75% Milestone - {goal_title}",
            message=f"You have completed 75% of your '{goal_title}' savings goal.",
            priority="MEDIUM",
            deduplicate=True,
        )
    elif percentage >= 50:
        create_notification_and_email(
            user=user,
            notification_type="GOAL_MILESTONE",
            title=f"50% Milestone - {goal_title}",
            message=f"You are halfway towards your '{goal_title}' savings goal.",
            priority="MEDIUM",
            deduplicate=True,
        )
