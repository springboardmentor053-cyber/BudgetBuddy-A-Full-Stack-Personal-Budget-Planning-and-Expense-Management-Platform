from django.db import models
from django.conf import settings


class SavingsGoal(models.Model):

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Completed", "Completed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="savings_goals"
    )

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

    target_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.goal_name
# class SavingsTransaction(models.Model):

#     goal = models.ForeignKey(
#         SavingsGoal,
#         on_delete=models.CASCADE,
#         related_name="transactions"
#     )

#     amount = models.DecimalField(
#         max_digits=10,
#         decimal_places=2
#     )

#     transaction_date = models.DateField()

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )