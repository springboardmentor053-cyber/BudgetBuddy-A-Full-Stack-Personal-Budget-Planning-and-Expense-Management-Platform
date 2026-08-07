from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from django.utils import timezone

from .utils import send_notification
from .models import Notification

from expenses.models import Expense
from budgets.models import Budget
from income.models import Income
from savings.models import SavingsGoal


# ==========================================
# 1. EXPENSE & BUDGET THRESHOLD SIGNALS
# ==========================================
@receiver(post_save, sender=Expense, dispatch_uid="handle_expense_notifications_receiver")
def handle_expense_notifications(sender, instance, created, **kwargs):
    expense_date = getattr(instance, "expense_date",
                           None) or timezone.now().date()
    user = instance.user
    category = instance.category

    # Send notification on expense creation only
    if created:
        send_notification(
            user=user,
            title="Expense Added",
            message=f"Expense of ₹{instance.amount} added under '{category}'.",
            notification_type="EXPENSE_ADDED",
            priority="LOW",
            event_date=expense_date,
        )

    # Check Budget Thresholds (Defensive Lookup) - runs for both Create and Update
    budget = Budget.objects.filter(user=user, category=category).first()
    if not budget or budget.monthly_limit <= 0:
        return

    monthly_limit = budget.monthly_limit

    # Calculate total spent for this category in the current month
    total_spent = Expense.objects.filter(
        user=user,
        category=category,
        expense_date__month=expense_date.month,
        expense_date__year=expense_date.year
    ).aggregate(total=Sum('amount'))['total'] or 0

    percentage = (total_spent / monthly_limit) * 100

    thresholds = [
        (
            100,
            "Budget Exceeded",
            f"Your {category} budget has been exceeded. Spent ₹{total_spent} of ₹{monthly_limit}.",
            "BUDGET_EXCEEDED",
            "CRITICAL"
        ),
        (
            90,
            "Budget High Warning (90%)",
            f"You have used 90% of your monthly {category} budget.",
            "BUDGET_WARNING",
            "HIGH"
        ),
        (
            80,
            "Budget Warning (80%)",
            f"You have used 80% of your monthly {category} budget.",
            "BUDGET_WARNING",
            "MEDIUM"
        ),
    ]

    for limit, title, message, notif_type, priority in thresholds:
        if percentage >= limit:
            already_notified = Notification.objects.filter(
                user=user,
                notification_type=notif_type,
                title=title,
                event_date__month=expense_date.month,
                event_date__year=expense_date.year,
            ).exists()

            if not already_notified:
                send_notification(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=notif_type,
                    priority=priority,
                    event_date=expense_date
                )
            break


# ==========================================
# 2. BUDGET CREATION & UPDATE SIGNALS
# ==========================================
@receiver(post_save, sender=Budget, dispatch_uid="handle_budget_events_receiver")
def handle_budget_created_or_updated(sender, instance, created, **kwargs):
    if created:
        title = "Budget Created"
        msg = f"New budget of ₹{instance.monthly_limit} established for '{instance.category}'."
    else:
        title = "Budget Updated"
        msg = f"Budget for '{instance.category}' updated to ₹{instance.monthly_limit}."

    send_notification(
        user=instance.user,
        title=title,
        message=msg,
        notification_type="BUDGET_EVENT",
        priority="LOW"
    )


# ==========================================
# 3. INCOME SIGNALS
# ==========================================
@receiver(post_save, sender=Income, dispatch_uid="handle_income_added_receiver")
def handle_income_added(sender, instance, created, **kwargs):
    if created:
        send_notification(
            user=instance.user,
            title="Income Added 💰",
            message=f"New income of ₹{instance.amount} recorded from '{getattr(instance, 'source', 'Income')}'.",
            notification_type="INCOME_ADDED",
            priority="LOW",
            event_date=getattr(instance, 'income_date', None)
        )


# ==========================================
# 4. SAVINGS SIGNALS
# ==========================================
MOTIVATIONAL_TIPS = {
    "Food": "Tip: Cooking meals at home can save up to 40% on monthly food costs!",
    "Shopping": "Tip: Wait 24 hours before making non-essential shopping purchases.",
    "Entertainment": "Tip: Look out for group discounts or subscription-sharing options.",
    "Travel": "Tip: Booking travel in advance helps lock in lower rates.",
}


@receiver(post_save, sender=SavingsGoal, dispatch_uid="handle_savings_goal_events_receiver")
def handle_savings_goal_events(sender, instance, created, **kwargs):
    goal_title = (
        getattr(instance, 'goal_name', None) or
        getattr(instance, 'title', None) or
        getattr(instance, 'name', 'Savings Goal')
    )

    if created:
        send_notification(
            user=instance.user,
            title="Savings Goal Created 🎯",
            message=f"Goal '{goal_title}' created with a target of ₹{instance.target_amount}.",
            notification_type="SAVINGS_CREATED",
            priority="LOW"
        )

        category = getattr(instance, 'category', 'General')
        tip = MOTIVATIONAL_TIPS.get(
            category, "Tip: Consistency is key! Small daily savings lead to big results."
        )
        send_notification(
            user=instance.user,
            title=f"Savings Tip for {category} 💡",
            message=tip,
            notification_type="MOTIVATION",
            priority="LOW"
        )
    else:
        saved_amount = (
            getattr(instance, 'saved_amount', None) or
            getattr(instance, 'current_amount', 0)
        )
        target = instance.target_amount

        if target <= 0:
            return

        percentage = (saved_amount / target) * 100

        # Note: Using GOAL_MILESTONE to strictly match Notification model choices
        milestones = [
            (100, "Goal Completed 🎉",
             f"Congratulations! You achieved your savings goal for '{goal_title}'.", "SAVINGS_COMPLETED", "HIGH"),
            (75, "Almost There! 🚀",
             f"Only {100 - int(percentage)}% left to complete your '{goal_title}' goal.", "GOAL_MILESTONE", "MEDIUM"),
            (50, "Halfway There! 🔥",
             f"You've reached {int(percentage)}% of your savings goal for '{goal_title}'.", "GOAL_MILESTONE", "LOW"),
            (25, "Great Start! 👏",
             f"You've saved {int(percentage)}% toward '{goal_title}'.", "GOAL_MILESTONE", "LOW"),
        ]

        for limit, title, message, notif_type, priority in milestones:
            if percentage >= limit:
                already_notified = Notification.objects.filter(
                    user=instance.user,
                    title=title,
                    message__contains=f"'{goal_title}'"
                ).exists()

                if not already_notified:
                    send_notification(
                        user=instance.user,
                        title=title,
                        message=message,
                        notification_type=notif_type,
                        priority=priority
                    )
                break
