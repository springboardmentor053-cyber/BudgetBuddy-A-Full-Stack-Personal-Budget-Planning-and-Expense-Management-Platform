from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    month = models.DateField()
    total_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_expense = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report - {self.month}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('budget_alert', 'Budget Alert'),
        ('savings_reminder', 'Savings Reminder'),
        ('monthly_report', 'Monthly Report'),
        ('goal_milestone', 'Goal Milestone'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.user.username}"