from .utils import calculate_budget_utilization
from notifications_app.models import Notification


def check_and_trigger_budget_alerts(user, category, month, year):

    print("🔥 Budget service called")

    budget, total_expense, utilization = calculate_budget_utilization(
        user, category, month, year
    )

    print("Budget:", budget)
    print("Expense:", total_expense)
    print("Utilization:", utilization)

    if not budget:
        return None

    # Handle threshold evaluations from highest to lowest
    if utilization >= 100 and not budget.warning_100_sent:
        Notification.objects.create(
            user=user,
            title="Budget Exceeded",
            message=f"Your {category} Budget has been exceeded.",
            notification_type="BUDGET_ALERT",
            priority="CRITICAL"
        )
        budget.warning_100_sent = True
        budget.save(update_fields=['warning_100_sent'])

    elif utilization >= 90 and not budget.warning_90_sent:
        Notification.objects.create(
            user=user,
            title="High Budget Alert",
            message=f"You have used 90% of your monthly {category} Budget.",
            notification_type="BUDGET_ALERT",
            priority="HIGH"
        )
        budget.warning_90_sent = True
        budget.save(update_fields=['warning_90_sent'])

    elif utilization >= 80 and not budget.warning_80_sent:
        Notification.objects.create(
            user=user,
            title="Budget Warning",
            message=f"You have used 80% of your monthly {category} Budget.",
            notification_type="BUDGET_ALERT",
            priority="MEDIUM"
        )
        budget.warning_80_sent = True
        budget.save(update_fields=['warning_80_sent'])

    return utilization
