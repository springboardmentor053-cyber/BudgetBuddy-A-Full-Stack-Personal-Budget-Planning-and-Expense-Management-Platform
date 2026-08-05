from django.db import models
from django.contrib.auth.models import User

STATUS_CHOICES = [
    ('ACTIVE', 'ACTIVE'),
    ('COMPLETED', 'COMPLETED'),
    ('CANCELLED', 'CANCELLED'),
]

PRIORITY_CHOICES = [
    ('LOW', 'LOW'),
    ('MEDIUM', 'MEDIUM'),
    ('HIGH', 'HIGH'),
]


class SavingsGoal(models.Model):
    """
    SavingsGoal model to store user savings goals.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    goal_name = models.CharField(max_length=200, help_text="Name of the savings goal.")
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Target savings amount.")
    saved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Current saved amount.")
    target_date = models.DateField(help_text="Target date to complete the goal.")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        help_text="Status of the goal (ACTIVE, COMPLETED, CANCELLED)."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_date', '-created_at']

    def __str__(self):
        return f"{self.goal_name} - {self.saved_amount}/{self.target_amount} ({self.status})"


class Notification(models.Model):
    """
    Notification model to store user alerts and notifications.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_notifications')
    title = models.CharField(max_length=200, help_text="Title of the notification.")
    message = models.TextField(help_text="Message body of the notification.")
    notification_type = models.CharField(max_length=50, help_text="Type of notification.")
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='MEDIUM',
        help_text="Priority level of the notification (LOW, MEDIUM, HIGH)."
    )
    is_read = models.BooleanField(default=False, help_text="Whether the notification has been read.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification({self.user.username}): {self.title}"

