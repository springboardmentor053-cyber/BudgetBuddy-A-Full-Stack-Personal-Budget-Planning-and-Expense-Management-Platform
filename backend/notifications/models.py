from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):

    NOTIFICATION_TYPES = [
    ("BUDGET_WARNING", "Budget Warning"),
    ("BUDGET_HIGH_WARNING", "Budget High Warning"),
    ("BUDGET_LIMIT", "Budget Limit Reached"),
    ("OVERSPENDING", "Overspending Alert"),
    ("SAVINGS_REMINDER", "Savings Reminder"),
    ("GOAL_MILESTONE", "Goal Milestone"),
    ("GOAL_COMPLETED", "Goal Completed"),
    ("MONTHLY_REPORT", "Monthly Report"),
    ("BUDGET_CREATED", "Budget Created"),
    ("BUDGET_UPDATED", "Budget Updated"),
    ("SAVINGS_GOAL_CREATED", "Savings Goal Created"),
]

    PRIORITY_CHOICES = [
        ("HIGH", "High"),
        ("MEDIUM", "Medium"),
        ("LOW", "Low"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    title = models.CharField(max_length=150)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES,
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="MEDIUM",
    )

    is_read = models.BooleanField(default=False)

    is_archived = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    class Meta:
        ordering = ["-created_at"]