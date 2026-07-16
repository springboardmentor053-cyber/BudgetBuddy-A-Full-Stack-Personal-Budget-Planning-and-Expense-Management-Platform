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
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.category} - {self.month}"