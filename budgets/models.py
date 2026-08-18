from django.db import models
from django.contrib.auth.models import User


class Budget(models.Model):

    CATEGORY_CHOICES = [
        ("FOOD", "Food"),
        ("TRAVEL", "Travel"),
        ("SHOPPING", "Shopping"),
        ("EDUCATION", "Education"),
        ("ENTERTAINMENT", "Entertainment"),
        ("HEALTHCARE", "Healthcare"),
        ("BILLS", "Bills"),
        ("MISCELLANEOUS", "Miscellaneous"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    budget_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    month = models.CharField(
        max_length=20
    )

    year = models.IntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )
    alert_80_sent = models.BooleanField(default=False)

    alert_90_sent = models.BooleanField(default=False)

    alert_100_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.category} - {self.month} {self.year}"