from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from savings.models import SavingsGoal
from budgets.models import Budget
from .models import Notification


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