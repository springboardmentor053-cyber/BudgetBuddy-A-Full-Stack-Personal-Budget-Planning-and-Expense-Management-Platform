"""Utilities for delivering budget-spending notifications."""

from decimal import Decimal
import threading

from django.conf import settings
from django.core.mail import send_mail

from .models import Notification


# Replace with your secondary test email address if testing self-delivery.
ALERT_RECIPIENT = 'xyz699911@gmail.com'


def _send_email_thread(subject, message, recipient_list):
    """Send an email and report delivery results from the background thread."""
    try:
        sender_email = getattr(settings, 'DEFAULT_FROM_EMAIL', ALERT_RECIPIENT)
        print(f"[EMAIL ENGINE] Attempting to send '{subject}' from {sender_email} to {recipient_list}...")

        html_message = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #38bdf8; margin-top: 0;">BudgetBuddy Alert</h2>
            <p style="font-size: 16px; line-height: 1.5;">{message}</p>
            <hr style="border-color: #334155; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">This is an automated notification from your BudgetBuddy Personal Finance OS.</p>
        </div>
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=sender_email,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        print("[EMAIL ENGINE] Email sent successfully!")
    except Exception as e:
        print(f"[EMAIL ERROR] Delivery failed: {e}")


def check_and_send_budget_alert(user, category, total_spent, budget_limit):
    """Create and email an alert when category spending reaches a budget tier."""
    category = category.strip()
    total_spent = Decimal(str(total_spent))
    budget_limit = Decimal(str(budget_limit))

    if budget_limit <= 0:
        return None

    percentage = (total_spent / budget_limit) * Decimal('100')

    if percentage >= Decimal('100'):
        priority = 'HIGH'
        app_title = f'🚨 Budget Exceeded: {category}'
        email_subject = f'[Budget Exceeded] {category}'
    elif percentage >= Decimal('90'):
        priority = 'HIGH'
        app_title = f'🚨 Critical Budget Alert (90%): {category}'
        email_subject = f'[Critical Budget Alert 90%] {category}'
    elif percentage >= Decimal('80'):
        priority = 'MEDIUM'
        app_title = f'⚠️ Budget Alert (80%): {category}'
        email_subject = f'[Budget Alert 80%] {category}'
    elif percentage >= Decimal('75'):
        priority = 'LOW'
        app_title = f'🔔 Budget Warning (75%): {category}'
        email_subject = f'[Budget Warning 75%] {category}'
    else:
        return None

    message = (
        f'You have spent ₹{total_spent:.2f} of your ₹{budget_limit:.2f} '
        f'budget for {category} ({percentage:.1f}%).'
    )

    notification = Notification.objects.create(
        user=user,
        title=app_title,
        message=message,
        notification_type='BUDGET_ALERT',
        priority=priority,
    )

    target_email = user.email if (user and user.email) else ALERT_RECIPIENT
    recipient_list = [target_email]

    print(f'[EMAIL ENGINE] Starting background email thread for {recipient_list}...')
    threading.Thread(
        target=_send_email_thread,
        args=(email_subject, message, recipient_list),
        daemon=True,
    ).start()

    return notification
