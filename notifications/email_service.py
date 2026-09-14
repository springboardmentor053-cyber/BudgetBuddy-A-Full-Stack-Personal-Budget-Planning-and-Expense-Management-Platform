import threading

from django.core.mail import send_mail
from django.conf import settings


def _send_email(
    subject,
    message,
    from_email,
    recipient_list,
):
    """
    Sends the email in a background thread.
    """

    try:

        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )

        print(
            f"[EMAIL] Sent successfully to {recipient_list}"
        )

    except Exception as error:

        print(
            f"[EMAIL] Failed to send to {recipient_list}: {error}"
        )


def send_notification_email(notification):

    user = notification.user

    if not user.email:
        print("[EMAIL] No email address for user, skipping")
        return False

    subject = f"BudgetBuddy - {notification.title}"
    message = notification.message
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    # Log configuration for debugging
    print(f"[EMAIL] Attempting to send to: {user.email}")
    print(f"[EMAIL] From: {from_email}")
    print(f"[EMAIL] Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"[EMAIL] SSL: {settings.EMAIL_USE_SSL}, TLS: {settings.EMAIL_USE_TLS}")
    print(f"[EMAIL] Host user set: {bool(settings.EMAIL_HOST_USER)}")
    print(f"[EMAIL] Host password set: {bool(settings.EMAIL_HOST_PASSWORD)}")

    # Send synchronously to capture result in logs
    _send_email(subject, message, from_email, recipient_list)

    return True