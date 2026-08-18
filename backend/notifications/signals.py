from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from expenses.models import Expense
from income.models import Income
from savings.models import SavingsGoal
from budgets.models import Budget
from .models import Notification
from .utils import send_fcm_push_to_user


# Helper function to trigger email reliably with error logging
def send_notification_email(user, title, message):
    if not user.email:
        print(f"⚠️ Email skipped: User '{user.username}' has no email address configured.")
        return

    try:
        send_mail(
            subject=f"[BudgetBuddy] {title}",
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'budgetbuddyassistant@gmail.com'),
            recipient_list=[user.email],
            fail_silently=False,  # Set to False so SendGrid/SMTP errors pop up in terminal
        )
        print(f"✅ Notification email sent successfully to {user.email}")
    except Exception as e:
        print(f"❌ Failed to send notification email to {user.email}: {e}")


# 1. Savings Goal Created & Completed Signals
@receiver(post_save, sender=SavingsGoal)
def savings_goal_notification(sender, instance, created, **kwargs):
    if created:
        title = "Savings Goal Created 🎯"
        message = f"Savings goal '{instance.goal_name}' with target ₹{instance.target_amount} was created."

        Notification.objects.create(
            user=instance.user,
            title=title,
            message=message,
            notification_type="SAVINGS_GOAL_CREATED",
            priority="LOW"
        )
        
        # 📧 Send Email to Gmail
        send_notification_email(instance.user, title, message)

    else:
        if instance.status == 'COMPLETED' or instance.saved_amount >= instance.target_amount:
            # Prevent duplicate completed notifications if already sent
            already_notified = Notification.objects.filter(
                user=instance.user,
                notification_type="SAVINGS_GOAL_COMPLETED",
                message__contains=instance.goal_name
            ).exists()

            if not already_notified:
                title = "Savings Goal Completed 🎉"
                message = f"Congratulations! You reached your savings goal '{instance.goal_name}'!"

                Notification.objects.create(
                    user=instance.user,
                    title=title,
                    message=message,
                    notification_type="SAVINGS_GOAL_COMPLETED",
                    priority="HIGH"
                )

                # 📧 Send Email to Gmail
                send_notification_email(instance.user, title, message)


# 2. Budget Signals
@receiver(pre_save, sender=Budget)
def track_budget_definition_change(sender, instance, **kwargs):
    """Ignore alert-flag saves; notify only when the budget itself changes."""
    if not instance.pk:
        instance._definition_changed = False
        return

    previous = sender.objects.get(pk=instance.pk)
    instance._definition_changed = any(
        getattr(previous, field) != getattr(instance, field)
        for field in ("category", "budget_amount", "month", "year")
    )


@receiver(post_save, sender=Budget)
def budget_update_notification(sender, instance, created, **kwargs):
    if not created and getattr(instance, "_definition_changed", False):
        title = "Budget Updated"
        message = f"Budget for '{instance.category}' was updated to ₹{instance.budget_amount}."
        Notification.objects.create(
            user=instance.user,
            title=title,
            message=message,
            notification_type="BUDGET_UPDATED",
            priority="LOW",
        )
        send_notification_email(instance.user, title, message)


@receiver(post_save, sender=Budget)
def budget_notification(sender, instance, created, **kwargs):
    if created:
        title = "Budget Created 📊"
        message = f"Budget of ₹{instance.budget_amount} set for category '{instance.category}'."

        Notification.objects.create(
            user=instance.user,
            title=title,
            message=message,
            notification_type="BUDGET_CREATED",
            priority="LOW"
        )

        # 📧 Send Email to Gmail
        send_notification_email(instance.user, title, message)


@receiver(post_save, sender=Expense)
def expense_creation_notification(sender, instance, created, **kwargs):
    if created:
        title = "Expense Added 💸"
        message = f"New expense '{instance.title}' worth ₹{instance.amount} was added."

        Notification.objects.create(
            user=instance.user,
            title=title,
            message=message,
            notification_type="EXPENSE_CREATED",
            priority="LOW",
        )
        send_notification_email(instance.user, title, message)
        send_fcm_push_to_user(instance.user, title, message, {"type": "expense", "title": instance.title})


@receiver(post_save, sender=Income)
def income_creation_notification(sender, instance, created, **kwargs):
    if created:
        title = "Income Added 💰"
        message = f"New income '{instance.title}' worth ₹{instance.amount} was recorded."

        Notification.objects.create(
            user=instance.user,
            title=title,
            message=message,
            notification_type="INCOME_CREATED",
            priority="LOW",
        )
        send_notification_email(instance.user, title, message)
        send_fcm_push_to_user(instance.user, title, message, {"type": "income", "title": instance.title})
