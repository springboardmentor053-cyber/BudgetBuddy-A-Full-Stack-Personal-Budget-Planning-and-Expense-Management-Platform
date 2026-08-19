from django.db.models.signals import post_save
from django.dispatch import receiver
from savings.models import SavingsGoal
from budgets.models import Budget
from .models import Notification

@receiver(post_save, sender=SavingsGoal)
def trigger_savings_goal_notifications(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="Savings Goal Created",
            message=f"New goal '{instance.goal_name}' created with target ₹{instance.target_amount}.",
            notification_type="SAVINGS",
            priority="MEDIUM"
        )
    elif instance.status == 'COMPLETED':
        Notification.objects.create(
            user=instance.user,
            title="Savings Goal Completed!",
            message=f"Congratulations! You reached your savings goal for '{instance.goal_name}'.",
            notification_type="SAVINGS",
            priority="HIGH"
        )

@receiver(post_save, sender=Budget)
def trigger_budget_notifications(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="Budget Limit Created",
            message=f"Budget limit of ₹{instance.budget_amount} set for category '{instance.category}'.",
            notification_type="BUDGET",
            priority="LOW"
        )
    else:
        Notification.objects.create(
            user=instance.user,
            title="Budget Limit Updated",
            message=f"Budget limit for '{instance.category}' updated to ₹{instance.budget_amount}.",
            notification_type="BUDGET",
            priority="MEDIUM"
        )