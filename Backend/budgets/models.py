from django.db import models
from django.contrib.auth.models import User


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    category = models.CharField(max_length=100)

    budget_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    month = models.CharField(max_length=20)

    year = models.IntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.month} {self.year})"


class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    goal_name = models.CharField(max_length=100)

    target_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    saved_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    deadline = models.DateField()

    def __str__(self):
        return self.goal_name