from django.core.mail import send_mail
from django.conf import settings

from .models import Notification


def create_notification(
    user,
    title,
    message,
    notification_type="INFO"
):
    """
    Creates an in-app notification
    and sends the same notification by email.
    """

    # -------------------------------------------------
    # CREATE IN-APP NOTIFICATION
    # -------------------------------------------------

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False
    )

    # -------------------------------------------------
    # SEND EMAIL
    # -------------------------------------------------

    if user.email:

        try:

            send_mail(
                subject=f"BudgetBuddy - {title}",

                message=message,

                from_email=settings.DEFAULT_FROM_EMAIL,

                recipient_list=[
                    user.email
                ],

                fail_silently=True
            )

        except Exception as error:

            print(
                "Email notification error:",
                error
            )

    return notification