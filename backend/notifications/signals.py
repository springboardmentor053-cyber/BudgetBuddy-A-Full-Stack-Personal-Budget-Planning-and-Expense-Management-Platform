from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from expenses.models import Expense
from income.models import Income
from savings.models import SavingsGoal
from budgets.models import Budget
from .models import Notification
from .utils import create_notification_safe, send_fcm_push_to_user


def send_notification_email(user, title, message):
    if not user.email:
        print(f"Email skipped: User '{user.username}' has no email address configured.")
        return

    try:
        send_mail(
            subject=f"[BudgetBuddy] {title}",
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'budgetbuddyassistant@gmail.com'),
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        print(f"Failed to send notification email to {user.email}: {exc}")


@receiver(post_save, sender=SavingsGoal)
def savings_goal_notification(sender, instance, created, **kwargs):
    try:
        if kwargs.get('raw'):
            return

        if created:
            title = "Savings Goal Created"
            message = f"Savings goal '{instance.goal_name}' with target ₹{instance.target_amount} was created."

            create_notification_safe(instance.user, title, message, "SAVINGS_GOAL_CREATED", "LOW")
            send_notification_email(instance.user, title, message)
            send_fcm_push_to_user(
                instance.user,
                title,
                message,
                {"type": "savings", "title": instance.goal_name},
            )
        else:
            if instance.status == 'COMPLETED' or instance.saved_amount >= instance.target_amount:
                already_notified = Notification.objects.filter(
                    user=instance.user,
                    notification_type="SAVINGS_GOAL_COMPLETED",
                    message__contains=instance.goal_name,
                ).exists()

                if not already_notified:
                    title = "Savings Goal Completed"
                    message = f"Congratulations! You reached your savings goal '{instance.goal_name}'!"

                    create_notification_safe(instance.user, title, message, "SAVINGS_GOAL_COMPLETED", "HIGH")
                    send_notification_email(instance.user, title, message)
                    send_fcm_push_to_user(
                        instance.user,
                        title,
                        message,
                        {"type": "savings_completed", "title": instance.goal_name},
                    )
    except Exception as exc:
        print(f"Savings signal failed for goal={getattr(instance, 'id', None)}: {exc}")


@receiver(pre_save, sender=Budget)
def track_budget_definition_change(sender, instance, **kwargs):
    if kwargs.get('raw'):
        return

    if not instance.pk:
        instance._definition_changed = False
        return

    try:
        previous = sender.objects.get(pk=instance.pk)
        instance._definition_changed = any(
            getattr(previous, field) != getattr(instance, field)
            for field in ("category", "budget_amount", "month", "year")
        )
    except sender.DoesNotExist:
        instance._definition_changed = False
    except Exception as exc:
        print(f"Budget change tracking failed for budget={getattr(instance, 'id', None)}: {exc}")
        instance._definition_changed = False


@receiver(post_save, sender=Budget)
def budget_update_notification(sender, instance, created, **kwargs):
    try:
        if kwargs.get('raw'):
            return

        if not created and getattr(instance, "_definition_changed", False):
            title = "Budget Updated"
            message = f"Budget for '{instance.category}' was updated to ₹{instance.budget_amount}."
            create_notification_safe(instance.user, title, message, "BUDGET_UPDATED", "LOW")
            send_notification_email(instance.user, title, message)
            send_fcm_push_to_user(
                instance.user,
                title,
                message,
                {"type": "budget_update", "title": str(instance.category)},
            )
    except Exception as exc:
        print(f"Budget update signal failed for budget={getattr(instance, 'id', None)}: {exc}")


@receiver(post_save, sender=Budget)
def budget_notification(sender, instance, created, **kwargs):
    try:
        if kwargs.get('raw'):
            return

        if created:
            title = "Budget Created"
            message = f"Budget of ₹{instance.budget_amount} set for category '{instance.category}'."
            create_notification_safe(instance.user, title, message, "BUDGET_CREATED", "LOW")
            send_notification_email(instance.user, title, message)
            send_fcm_push_to_user(
                instance.user,
                title,
                message,
                {"type": "budget_created", "title": str(instance.category)},
            )
    except Exception as exc:
        print(f"Budget create signal failed for budget={getattr(instance, 'id', None)}: {exc}")


@receiver(post_save, sender=Expense)
def expense_creation_notification(sender, instance, created, **kwargs):
    try:
        if kwargs.get('raw'):
            return

        if created:
            title = "Expense Added"
            message = f"New expense '{instance.title}' worth ₹{instance.amount} was added."
            create_notification_safe(instance.user, title, message, "EXPENSE_CREATED", "LOW")
            send_notification_email(instance.user, title, message)
            send_fcm_push_to_user(
                instance.user,
                title,
                message,
                {"type": "expense", "title": instance.title},
            )
    except Exception as exc:
        print(f"Expense signal failed for expense={getattr(instance, 'id', None)}: {exc}")


@receiver(post_save, sender=Income)
def income_creation_notification(sender, instance, created, **kwargs):
    try:
        if kwargs.get('raw'):
            return

        if created:
            title = "Income Added"
            message = f"New income '{instance.title}' worth ₹{instance.amount} was recorded."
            create_notification_safe(instance.user, title, message, "INCOME_CREATED", "LOW")
            send_notification_email(instance.user, title, message)
            send_fcm_push_to_user(
                instance.user,
                title,
                message,
                {"type": "income", "title": instance.title},
            )
    except Exception as exc:
        print(f"Income signal failed for income={getattr(instance, 'id', None)}: {exc}")
