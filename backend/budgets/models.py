from django.contrib.auth.models import User
from django.db import models


class Budget(models.Model):
    CATEGORY_CHOICES = [
        ("Food", "Food"),
        ("Travel", "Travel"),
        ("Shopping", "Shopping"),
        ("Education", "Education"),
        ("Entertainment", "Entertainment"),
        ("Healthcare", "Healthcare"),
        ("Bills", "Bills"),
        ("Miscellaneous", "Miscellaneous"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="budgets",
        null=True,
        blank=True,
    )

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    month = models.CharField(max_length=20)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "category", "month"],
                name="unique_budget_per_user_category_month",
            )
        ]

    def __str__(self):
        return f"{self.category} - {self.month}"


class SavingsGoal(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="savings_goals",
    )

    title = models.CharField(max_length=100)

    target_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    saved_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    target_date = models.DateField(
        null=True,
        blank=True,
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title