from django.core.mail import send_mail
from django.conf import settings


def send_notification_email(notification):
    """
    Send an email for a BudgetBuddy notification.
    """

    user = notification.user

    # ---------------------------------------------------------
    # Check whether the user has an email address
    # ---------------------------------------------------------

    if not user.email:
        print(
            f"No email address found for user: {user.username}"
        )
        return False

    # ---------------------------------------------------------
    # Email subject
    # ---------------------------------------------------------

    subject = f"BudgetBuddy - {notification.title}"

    # ---------------------------------------------------------
    # Email body
    # ---------------------------------------------------------

    message = f"""
Hello {user.username},

You have a new notification from BudgetBuddy.

----------------------------------------
{notification.title}
----------------------------------------

{notification.message}

Type: {notification.notification_type}
Priority: {notification.priority}

Please login to your BudgetBuddy account to view
and manage your finances.

Regards,
BudgetBuddy Team
"""

    # ---------------------------------------------------------
    # Send email
    # ---------------------------------------------------------

    try:

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        print(
            f"Notification email sent to {user.email}"
        )

        return True

    except Exception as error:

        print(
            "Notification email failed:",
            error
        )

        return False