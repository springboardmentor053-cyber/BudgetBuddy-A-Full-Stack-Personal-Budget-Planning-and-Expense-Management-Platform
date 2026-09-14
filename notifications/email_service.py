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

    # =====================================================
    # NO EMAIL ADDRESS
    # =====================================================

    if not user.email:

        return False


    # =====================================================
    # EMAIL DETAILS
    # =====================================================

    subject = (
        f"BudgetBuddy - "
        f"{notification.title}"
    )

    message = notification.message

    from_email = (
        settings.DEFAULT_FROM_EMAIL
    )

    recipient_list = [
        user.email
    ]


    # =====================================================
    # SEND EMAIL IN BACKGROUND
    # =====================================================

    email_thread = threading.Thread(

        target=_send_email,

        args=(
            subject,
            message,
            from_email,
            recipient_list,
        ),

        daemon=True,

    )

    email_thread.start()


    # =====================================================
    # API DOES NOT WAIT FOR EMAIL
    # =====================================================

    return True