from django.db import models
from django.contrib.auth.models import User


class SavingsGoal(models.Model):

    GOAL_CHOICES = [
        ('New Laptop Fund', 'New Laptop Fund'),
        ('Japan Trip Fund', 'Japan Trip Fund'),
        ('Emergency Savings', 'Emergency Savings'),
        ('Education', 'Education'),
        ('Other', 'Other'),
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

    is_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.goal_name
