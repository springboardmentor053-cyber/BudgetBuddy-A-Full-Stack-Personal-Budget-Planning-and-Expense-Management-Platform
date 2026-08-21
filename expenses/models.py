from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from django.core.validators import MinValueValidator



class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('FOOD', 'FOOD'),
        ('TRAVEL', 'TRAVEL'),
        ('SHOPPING', 'SHOPPING'),
        ('EDUCATION', 'EDUCATION'),
        ('ENTERTAINMENT', 'ENTERTAINMENT'),
        ('HEALTHCARE', 'HEALTHCARE'),
        ('BILLS', 'BILLS'),
        ('SAVINGS', 'SAVINGS'),
        ('MISCELLANEOUS', 'MISCELLANEOUS'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.TextField(blank=True)
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.category}"