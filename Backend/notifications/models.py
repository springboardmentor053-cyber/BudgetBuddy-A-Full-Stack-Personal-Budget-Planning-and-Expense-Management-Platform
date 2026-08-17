from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    # Notification Type Choices
    NOTIFICATION_TYPES = [
        ('SAVINGS', 'Savings'),
        ('BUDGET', 'Budget'),
        ('REPORT', 'Report'),
        ('ANALYTICS', 'Analytics'),
        ('GENERAL', 'General'),
    ]

    # Priority Choices
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]

    # User
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # Notification Title
    title = models.CharField(
        max_length=200
    )

    # Notification Message
    message = models.TextField()

    # Notification Type
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='GENERAL'
    )

    # Priority
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='MEDIUM'
    )

    # Read Status
    is_read = models.BooleanField(
        default=False
    )

    # Created Time
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.title} - {self.user.username}"