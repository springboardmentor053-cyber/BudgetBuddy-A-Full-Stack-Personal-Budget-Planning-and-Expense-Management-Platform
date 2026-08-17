from django.core.mail import send_mail
from django.conf import settings


def send_notification_email(notification):
    """
    Send an email for important notifications.
    """

    user = notification.user

    # User must have an email address
    if not user.email:
        return False

    # Only HIGH priority notifications send emails
    if notification.priority != "HIGH":
        return False

    subject = f"Budget Buddy - {notification.title}"

    message = f"""
Hello {user.first_name or user.username},

You have a new important notification from Budget Buddy.

{notification.title}

{notification.message}

Please log in to Budget Buddy to view more details.

Thank you,
Budget Buddy
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return True