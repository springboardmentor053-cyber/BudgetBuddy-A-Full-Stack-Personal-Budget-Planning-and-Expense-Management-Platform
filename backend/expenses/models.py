from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('FOOD', 'Food'),
        ('TRAVEL', 'Travel'),
        ('SHOPPING', 'Shopping'),
        ('EDUCATION', 'Education'),
        ('ENTERTAINMENT', 'Entertainment'),
        ('HEALTHCARE', 'Healthcare'),
        ('BILLS', 'Bills'),
        ('MISCELLANEOUS', 'Miscellaneous'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='MISCELLANEOUS')
    created_at = models.DateTimeField(auto_now_add=True)
    # Allow user-specified date for the expense (defaults to today)
    expense_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.category})"
