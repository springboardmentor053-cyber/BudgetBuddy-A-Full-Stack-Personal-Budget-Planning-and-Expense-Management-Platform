from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Notification


@receiver(post_save, sender=Notification)
def send_notification_email(
    sender,
    instance,
    created,
    **kwargs
):

    # Email sending is handled by the individual API/view.
    # This signal intentionally does nothing.
    return