from django.db import models
from django.contrib.auth.models import User


class SavingsGoal(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    goal_name = models.CharField(
        max_length=100
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

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    @property
    def remaining_amount(self):
        return self.target_amount - self.saved_amount

    @property
    def progress_percentage(self):

        if self.target_amount == 0:
            return 0

        return round(
            (self.saved_amount / self.target_amount) * 100,
            2
        )

    def __str__(self):
        return self.goal_name