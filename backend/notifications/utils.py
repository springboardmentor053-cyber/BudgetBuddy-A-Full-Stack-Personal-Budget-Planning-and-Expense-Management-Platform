"""Utilities for delivering budget-spending notifications."""

import logging
import threading

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email

from .models import Notification


logger = logging.getLogger(__name__)


def _send_email_thread(subject, message, recipient_list):
    """Send an email and report delivery results from the background thread."""
    try:
        sender_email = settings.DEFAULT_FROM_EMAIL
        logger.info("Sending notification email subject=%r recipients=%s", subject, recipient_list)

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
        logger.info("Notification email sent to %s", recipient_list)
    except Exception:
        logger.error("Notification email delivery failed for recipients=%s", recipient_list, exc_info=True)


def check_and_send_budget_alert(user, category, total_spent, budget_limit):
    """Create and email an alert when category spending reaches a budget tier."""
    category = category.strip()

    if float(budget_limit) <= 0:
        return None

    percentage = (float(total_spent) / float(budget_limit)) * 100

    if percentage >= 100:
        priority = 'HIGH'
        app_title = f'🚨 Budget Exceeded: {category}'
        email_subject = f'[Budget Exceeded] {category}'
    elif percentage >= 90:
        priority = 'HIGH'
        app_title = f'🚨 Critical Budget Alert (90%): {category}'
        email_subject = f'[Critical Budget Alert 90%] {category}'
    elif percentage >= 80:
        priority = 'MEDIUM'
        app_title = f'⚠️ Budget Alert (80%): {category}'
        email_subject = f'[Budget Alert 80%] {category}'
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

    logger.info(
        'Budget alert triggered for user=%s category=%s spent=%s limit=%s utilized=%.1f%%',
        user.pk, category, total_spent, budget_limit, percentage,
    )
    try:
        validate_email(user.email)
    except (AttributeError, TypeError, ValidationError):
        logger.warning('Budget alert email skipped because user_id=%s has no valid email address.', user.pk)
        return notification

    recipient_list = [user.email]
    threading.Thread(
        target=_send_email_thread,
        args=(email_subject, message, recipient_list),
        daemon=True,
    ).start()

    return notification
