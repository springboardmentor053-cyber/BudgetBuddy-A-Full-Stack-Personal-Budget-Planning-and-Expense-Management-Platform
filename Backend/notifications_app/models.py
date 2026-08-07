from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    NOTIFICATION_TYPES = [
        ("EXPENSE_ADDED", "Expense Added"),
        ("INCOME_ADDED", "Income Added"),

        ("BUDGET_EVENT", "Budget Event"),
        ("BUDGET_INFO", "Budget Info"),
        ("BUDGET_WARNING", "Budget Warning"),
        ("BUDGET_EXCEEDED", "Budget Exceeded"),

        ("SAVINGS_CREATED", "Savings Goal Created"),
        ("SAVINGS_COMPLETED", "Savings Goal Completed"),
        ("GOAL_MILESTONE", "Goal Milestone"),
        ("SAVINGS_REMINDER", "Savings Reminder"),

        ("MONTHLY_REPORT", "Monthly Report"),
        ("MOTIVATION", "Motivational Tip"),
    ]
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
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
        default="BUDGET_INFO"
    )

    is_read = models.BooleanField(default=False)

    # NEW FIELD
    event_date = models.DateField(null=True, blank=True)


    priority = models.CharField(
    max_length=10, choices=PRIORITY_CHOICES, default='LOW')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f"[{self.priority}] {self.title} - {self.user.username}"
