from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SavingsGoal(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='app_savings_goals'  # <--- Updated to prevent clash with users.SavingsGoal
    )
    goal_name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    target_date = models.DateField()
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='IN_PROGRESS'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.goal_name} - {self.user.username}"

    @property
    def remaining_amount(self):
        """Calculates Remaining Amount = Target Amount - Saved Amount"""
        remaining = float(self.target_amount) - float(self.saved_amount)
        return max(0.0, remaining)

    @property
    def progress_percentage(self):
        """Calculates percentage towards completing goal"""
        if float(self.target_amount) > 0:
            percentage = (float(self.saved_amount) / float(self.target_amount)) * 100
            return min(100.0, round(percentage, 2))
        return 0.0