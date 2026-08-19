from django.db import models
from django.contrib.auth.models import User

class SavingsGoal(models.Model):
    STATUS_CHOICES = (
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    goal_name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')

    def __str__(self):
        return f"{self.goal_name} - ₹{self.saved_amount}/{self.target_amount}"