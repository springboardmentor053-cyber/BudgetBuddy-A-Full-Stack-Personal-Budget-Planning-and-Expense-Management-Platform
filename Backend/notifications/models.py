from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    TYPE_CHOICES = [
        ("INFO", "INFO"),
        ("SUCCESS", "SUCCESS"),
        ("WARNING", "WARNING"),
        ("ALERT", "ALERT"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    title = models.CharField(
        max_length=150
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="INFO"
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title