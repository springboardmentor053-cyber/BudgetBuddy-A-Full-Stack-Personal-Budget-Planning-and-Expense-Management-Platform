from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification

# Import models
from savings.models import SavingsGoal
from budgets.models import Budget


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