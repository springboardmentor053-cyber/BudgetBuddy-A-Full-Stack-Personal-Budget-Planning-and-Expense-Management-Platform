from .models import Notification


def create_notification(
    user,
    title,
    message,
    notification_type="GENERAL",
    priority="MEDIUM"
):

    # Create notification only
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority
    )

    return notification