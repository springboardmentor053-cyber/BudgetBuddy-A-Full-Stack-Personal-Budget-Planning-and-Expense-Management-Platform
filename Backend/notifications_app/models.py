from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    NOTIFICATION_TYPES = [
        ("BUDGET_ALERT", "Budget Alert"),
        ("SAVINGS_REMINDER", "Savings Reminder"),
        ("GOAL_MILESTONE", "Goal Milestone"),
        ("MONTHLY_REPORT", "Monthly Report"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(max_length=200)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES,
        default="BUDGET_ALERT"
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
