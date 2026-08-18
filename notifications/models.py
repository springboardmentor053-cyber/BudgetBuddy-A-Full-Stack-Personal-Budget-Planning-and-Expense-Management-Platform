from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    NOTIFICATION_TYPES = [
    # Income
    ("income_added", "Income Added"),
    ("income_updated", "Income Updated"),
    ("income_deleted", "Income Deleted"),

    # Expense
    ("expense_added", "Expense Added"),
    ("expense_updated", "Expense Updated"),
    ("expense_deleted", "Expense Deleted"),

    # Budget
    ("budget_created", "Budget Created"),
    ("budget_updated", "Budget Updated"),
    ("budget_deleted", "Budget Deleted"),
    ("budget_warning", "Budget Warning"),
    ("budget_exceeded", "Budget Exceeded"),
    # Savings
    ("savings_created", "Savings Goal Created"),
    ("savings_updated", "Savings Goal Updated"),
    ("savings_deleted", "Savings Goal Deleted"),
    ("savings_completed", "Savings Goal Completed"),

    # General
    ("general", "General"),
]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=200)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES,
        default="general"
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title