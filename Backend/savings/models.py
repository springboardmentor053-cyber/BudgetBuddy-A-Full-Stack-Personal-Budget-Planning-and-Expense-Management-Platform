from django.db import models
from django.contrib.auth.models import User


class SavingsGoal(models.Model):

    GOAL_CHOICES = [
        ('TRAVEL', 'Travel'),
        ('EDUCATION', 'Education'),
        ('EMERGENCY', 'Emergency Fund'),
        ('HOME', 'Home'),
        ('VEHICLE', 'Vehicle'),
        ('GADGETS', 'Gadgets'),
        ('INVESTMENT', 'Investment'),
        ('HEALTH', 'Health'),
        ('RETIREMENT', 'Retirement'),
        ('OTHER', 'Other'),
    ]


    goal_type = models.CharField(
         max_length=20,
        choices=GOAL_CHOICES,
        default='OTHER'
    )
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='savings_goals'
    )

    goal_name = models.CharField(max_length=100)

    goal_type = models.CharField(
        max_length=30,
        choices=GOAL_CHOICES,
        default='Other'
    )

    target_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    saved_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    target_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.goal_name
