from django.contrib.auth.models import User
from django.db import models


class Expense(models.Model):
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
        related_name="expenses",
        null=True,
        blank=True
    )
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default="Other"
    )
    date = models.DateField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"
class Income(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="incomes",
        null=True,
        blank=True
    )
    source = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.source} - {self.amount}"