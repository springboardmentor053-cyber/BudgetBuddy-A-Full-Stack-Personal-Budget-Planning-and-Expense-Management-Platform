from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Expense
from budgets.services import check_and_trigger_budget_alerts


@receiver(post_save, sender=Expense)
def handle_expense_save(sender, instance, **kwargs):
    print("🔥 Expense signal fired")

    check_and_trigger_budget_alerts(
        user=instance.user,
        category=instance.category,
        month=instance.expense_date.month,
        year=instance.expense_date.year
    )


@receiver(post_delete, sender=Expense)
def handle_expense_delete(sender, instance, **kwargs):
    check_and_trigger_budget_alerts(
        user=instance.user,
        category=instance.category,
        month=instance.expense_date.month,
        year=instance.expense_date.year
    )


@receiver(post_save, sender=Expense)
def handle_expense_save(sender, instance, created, **kwargs):
    print("🔥 Expense signal fired")
    if created:
        check_and_trigger_budget_alerts(
            user=instance.user,
            category=instance.category,
            month=instance.expense_date.month,
            year=instance.expense_date.year
        )
