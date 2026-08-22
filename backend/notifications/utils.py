from django.core.mail import send_mail
from django.conf import settings
import logging
import json
import urllib.request
import urllib.error

from .models import DeviceToken, Notification

logger = logging.getLogger(__name__)


def create_notification_safe(user, title, message, notification_type, priority='LOW'):
    """
    Create a notification without breaking the caller if the notifications
    table, schema, or database is temporarily unavailable.
    """
    try:
        return Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
        )
    except Exception as exc:
        logger.exception(
            "Failed to create notification for user=%s title=%s: %s",
            getattr(user, "username", user),
            title,
            exc,
        )
        return None

def send_budget_alert_email(user_email, username, category_name, current_spent, budget_limit):
    subject = f'⚠️ Budget Buddy Alert: Exceeded {category_name} Limit!'
    
    message = (
        f"Hi {username},\n\n"
        f"You have spent ${current_spent:.2f} on '{category_name}', which exceeds your set budget limit of ${budget_limit:.2f}.\n\n"
        f"Log into BudgetBuddy to adjust your limits or review your recent expenses.\n\n"
        f"Best,\n"
        f"The BudgetBuddy Team 💰"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        print(f"Email successfully sent to {user_email}!")
    except Exception as e:
        print(f"Failed to send email: {e}")


def send_fcm_push_to_user(user, title, body, data=None):
    server_key = getattr(settings, 'FCM_SERVER_KEY', '')
    if not server_key:
        return

    tokens = list(DeviceToken.objects.filter(user=user).values_list('token', flat=True))
    if not tokens:
        return

    payload = {
        'registration_ids': tokens,
        'notification': {
            'title': title,
            'body': body,
        },
        'data': data or {},
        'priority': 'high',
    }

    request = urllib.request.Request(
        'https://fcm.googleapis.com/fcm/send',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'key={server_key}',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            response.read()
    except urllib.error.HTTPError as exc:
        print(f'FCM push failed: {exc.read().decode("utf-8", errors="ignore")}')
    except Exception as exc:
        print(f'FCM push failed: {exc}')
