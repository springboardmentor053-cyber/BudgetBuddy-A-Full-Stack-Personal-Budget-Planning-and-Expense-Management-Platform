from django.db import models
from django.contrib.auth.models import User


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


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.category}"