from decimal import Decimal
from notifications.utils import create_notification_safe


def check_and_trigger_budget_alert(budget, total_expense):
    if not budget.budget_amount or budget.budget_amount <= 0:
        return 0, "NORMAL", ""

    utilization = (Decimal(total_expense) / Decimal(budget.budget_amount)) * Decimal(100)
    alert_level = "NORMAL"
    alert_message = ""
    category_display = budget.get_category_display()

    # 100% or More → Budget Exceeded Alert
    if utilization >= 100:
        alert_level = "BUDGET_EXCEEDED"
        alert_message = f"Your {category_display} Budget has been exceeded."
        
        if not budget.alert_100_sent:
            create_notification_safe(
                budget.user,
                "Budget Exceeded",
                alert_message,
                "BUDGET_ALERT",
                "CRITICAL",
            )
            budget.alert_100_sent = True
            # Only update the flag field to prevent triggering save hooks repeatedly
            budget.save(update_fields=['alert_100_sent'])

    # 90% → High Warning Alert
    elif utilization >= 90:
        alert_level = "HIGH_WARNING"
        alert_message = f"High Alert: You have used {int(utilization)}% of your monthly {category_display} Budget."
        
        if not budget.alert_90_sent:
            create_notification_safe(
                budget.user,
                "High Alert",
                alert_message,
                "BUDGET_ALERT",
                "HIGH",
            )
            budget.alert_90_sent = True
            budget.save(update_fields=['alert_90_sent'])

    # 80% → Warning Alert
    elif utilization >= 80:
        alert_level = "WARNING"
        alert_message = f"Warning: You have used {int(utilization)}% of your monthly {category_display} Budget."
        
        if not budget.alert_80_sent:
            create_notification_safe(
                budget.user,
                "Warning",
                alert_message,
                "BUDGET_ALERT",
                "MEDIUM",
            )
            budget.alert_80_sent = True
            budget.save(update_fields=['alert_80_sent'])

    return round(utilization, 2), alert_level, alert_message
