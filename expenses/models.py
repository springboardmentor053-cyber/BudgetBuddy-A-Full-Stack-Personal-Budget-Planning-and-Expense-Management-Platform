from django.db import models
from django.contrib.auth.models import User


class Expense(models.Model):

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

    title = models.CharField(max_length=100)

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    expense_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title