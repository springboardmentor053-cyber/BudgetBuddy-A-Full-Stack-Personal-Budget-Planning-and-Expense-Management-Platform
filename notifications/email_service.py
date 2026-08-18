# from django.core.mail import send_mail
# from django.conf import settings


# def send_notification_email(user, title, message):
#     if not user.email:
#         return

#     send_mail(
#         subject=title,
#         message=message,
#         from_email=settings.DEFAULT_FROM_EMAIL,
#         recipient_list=[user.email],
#         fail_silently=False,
#     )
from django.core.mail import send_mail
from django.conf import settings


def send_notification_email(user, title, message):

    print("========== EMAIL DEBUG ==========")
    print("Username:", user.username)
    print("Email:", user.email)
    print("Sender:", settings.DEFAULT_FROM_EMAIL)
    print("Title:", title)
    print("Message:", message)
    print("=================================")

    if not user.email:
        print("❌ USER HAS NO EMAIL")
        return

    send_mail(
        subject=title,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    print("✅ EMAIL SENT TO:", user.email)