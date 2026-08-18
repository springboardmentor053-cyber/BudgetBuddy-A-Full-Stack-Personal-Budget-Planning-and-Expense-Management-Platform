from notifications.utils import create_notification


def budget_warning(budget):
    create_notification(
        budget.user,
        "⚠ Budget Warning",
        f"Warning: You have used 80% of your monthly {budget.category.title()} Budget."
    )
def budget_high_warning(budget):
    create_notification(
        budget.user,
        "🚨 High Budget Warning",
        f"High Alert: You have used 90% of your monthly {budget.category.title()} Budget."
    )
def budget_exceeded(budget):
    create_notification(
        budget.user,
        "❌ Budget Exceeded",
        f"Your {budget.category.title()} Budget has been exceeded."
    )