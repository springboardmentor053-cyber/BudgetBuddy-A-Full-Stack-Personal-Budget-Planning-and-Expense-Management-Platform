from django.db import models
from django.contrib.auth.models import User



class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('FOOD', 'FOOD'),
        ('TRAVEL', 'TRAVEL'),
        ('SHOPPING', 'SHOPPING'),
        ('EDUCATION', 'EDUCATION'),
        ('ENTERTAINMENT', 'ENTERTAINMENT'),
        ('HEALTHCARE', 'HEALTHCARE'),
        ('BILLS', 'BILLS'),
        ('MISCELLANEOUS', 'MISCELLANEOUS'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.category}"