from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from expenses.models import Expense
from .models import Budget
from notifications.models import Notification

@receiver(post_save, sender=Expense)
def check_budget_alerts(sender, instance, **kwargs):
    user = instance.user
    category = instance.category

    # Find budget matching the expense category
    budget = Budget.objects.filter(user=user, category=category).first()
    if not budget or budget.limit <= 0:
        return

    # Task 1: Calculate Total Expense for Category
    total_expense = Expense.objects.filter(user=user, category=category).aggregate(
        total=Sum('amount')
    )['total'] or 0

    # Task 1 Formula: Budget utilization = (Total Expense / Budget Amount) * 100
    utilization = (float(total_expense) / float(budget.limit)) * 100

    alert_level = None
    title = ""
    message = ""
    priority = "MEDIUM"
    threshold = 0

    # Task 2: Threshold Alerts Rules
    if utilization >= 100 and budget.last_alert_threshold < 100:
        threshold = 100
        alert_level = "Budget Exceeded"
        title = "Budget Exceeded Alert"
        message = f"Budget Exceeded: Your budget for '{category}' has been exceeded."
        priority = "HIGH"
    elif utilization >= 90 and budget.last_alert_threshold < 90:
        threshold = 90
        alert_level = "High Warning Alert"
        title = "High Budget Alert"
        message = f"High Alert: You have used {int(utilization)}% of your monthly '{category}' budget."
        priority = "MEDIUM"
    elif utilization >= 80 and budget.last_alert_threshold < 80:
        threshold = 80
        alert_level = "Warning Alert"
        title = "Budget Warning"
        message = f"Warning: You have used {int(utilization)}% of your monthly '{category}' budget."
        priority = "LOW"

    # Task 3 & 4: Create Notification & update threshold tracking
    if alert_level and threshold > 0:
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type="BUDGET",
            priority=priority
        )
        budget.last_alert_threshold = threshold
        budget.save()