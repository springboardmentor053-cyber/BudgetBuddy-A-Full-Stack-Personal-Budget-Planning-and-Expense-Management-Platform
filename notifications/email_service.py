import threading
from django.core.mail import send_mail
from django.conf import settings


def _send_email(subject, message, from_email, recipient_list):
    """Send email — runs in a background thread."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        print(f"[EMAIL] Sent successfully to {recipient_list}")
    except Exception as error:
        print(f"[EMAIL] Failed: {error}")


def send_notification_email(notification):

    user = notification.user

    if not user.email:
        return False

    subject = f"BudgetBuddy - {notification.title}"
    message = notification.message
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    print(f"[EMAIL] Queuing email to: {user.email}")

    # Send in background thread so API response is not blocked
    email_thread = threading.Thread(
        target=_send_email,
        args=(subject, message, from_email, recipient_list),
        daemon=True,
    )
    email_thread.start()

    return True
