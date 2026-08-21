import datetime
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from django.core.validators import MinValueValidator

class SavingsGoal(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    goal_name = models.CharField(max_length=100)
    target_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    saved_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Automation fields
    is_automated = models.BooleanField(default=False)
    auto_save_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    frequency = models.CharField(
        max_length=20, 
        choices=[
            ('Daily', 'Daily'), 
            ('Weekly', 'Weekly'), 
            ('Monthly', 'Monthly'), 
            ('Custom', 'Custom')
        ], 
        default='Monthly'
    )
    custom_interval_days = models.IntegerField(default=30, null=True, blank=True)
    auto_save_start_date = models.DateField(default=datetime.date.today, null=True, blank=True)
    last_auto_save_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.saved_amount >= self.target_amount:
            self.status = 'Completed'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.goal_name} ({self.status})"
