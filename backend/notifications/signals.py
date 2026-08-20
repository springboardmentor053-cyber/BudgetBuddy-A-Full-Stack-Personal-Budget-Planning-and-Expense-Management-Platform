from decimal import Decimal, InvalidOperation

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification

# Import models
from savings.models import SavingsGoal
from budgets.models import Budget
from income.models import Income
from users.models import Expense, Income as LegacyIncome


def _create_transaction_notification(instance, created, transaction_type, title, amount, date_value):
    action = 'added' if created else 'updated'
    try:
        formatted_amount = Decimal(str(amount)).quantize(Decimal('0.01'))
    except (InvalidOperation, TypeError, ValueError):
        formatted_amount = Decimal('0.00')
    Notification.objects.create(
        user=instance.user,
        title=f'{transaction_type} {action.title()}',
        message=(
            f'{transaction_type} "{title}" of ₹{formatted_amount:.2f} '
            f'was {action} for {date_value}.'
        ),
        notification_type='TRANSACTION',
        priority='LOW' if created else 'MEDIUM',
    )


@receiver(post_save, sender=Expense)
def expense_notifications(sender, instance, created, **kwargs):
    _create_transaction_notification(
        instance, created, 'Expense', instance.title, instance.amount, instance.expense_date,
    )


@receiver(post_save, sender=Income)
def income_notifications(sender, instance, created, **kwargs):
    _create_transaction_notification(
        instance, created, 'Income', instance.title, instance.amount, instance.income_date,
    )


@receiver(post_save, sender=LegacyIncome)
def legacy_income_notifications(sender, instance, created, **kwargs):
    """Keep notifications working for the original income endpoint as well."""
    _create_transaction_notification(
        instance, created, 'Income', instance.source, instance.amount, instance.date,
    )


# 1️⃣ Savings Goal Signals
@receiver(post_save, sender=SavingsGoal)
def savings_goal_notifications(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="New Savings Goal Created",
            message=f"Your savings goal '{getattr(instance, 'goal_name', 'Goal')}' has been created.",
            notification_type="SAVINGS_GOAL",
            priority="LOW"
        )
    else:
        saved = getattr(instance, 'saved_amount', 0)
        target = getattr(instance, 'target_amount', 0)
        if (target > 0 and saved >= target) or str(getattr(instance, 'status', '')).upper() == "COMPLETED":
            already_notified = Notification.objects.filter(
                user=instance.user,
                title=f"Savings Goal Completed: {getattr(instance, 'goal_name', 'Goal')}"
            ).exists()
            
            if not already_notified:
                Notification.objects.create(
                    user=instance.user,
                    title=f"Savings Goal Completed: {getattr(instance, 'goal_name', 'Goal')}",
                    message=f"Congratulations! You reached your goal '{getattr(instance, 'goal_name', 'Goal')}'!",
                    notification_type="SAVINGS_GOAL",
                    priority="HIGH"
                )


# 2️⃣ Budget Signals (Uses `budget_amount` to avoid AttributeError)
@receiver(post_save, sender=Budget)
def budget_notifications(sender, instance, created, **kwargs):
    # Safely retrieve budget amount or fallback to amount
    amount = getattr(instance, 'budget_amount', getattr(instance, 'amount', '0'))
    category = getattr(instance, 'category', 'Budget')

    if created:
        Notification.objects.create(
            user=instance.user,
            title="New Budget Created",
            message=f"A budget for '{category}' set to ${amount} has been created.",
            notification_type="BUDGET_ALERT",
            priority="LOW"
        )
    else:
        Notification.objects.create(
            user=instance.user,
            title="Budget Updated",
            message=f"Your budget for '{category}' has been updated to ${amount}.",
            notification_type="BUDGET_ALERT",
            priority="MEDIUM"
        )
