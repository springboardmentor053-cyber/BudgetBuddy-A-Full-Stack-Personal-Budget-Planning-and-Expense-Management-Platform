from django.db import models
from django.contrib.auth.models import User

class Income(models.Model):
    # Task 4: Income source choices
    SOURCE_CHOICES = [
        ('SALARY', 'Salary'),
        ('POCKET_MONEY', 'Pocket Money'),
        ('SCHOLARSHIP', 'Scholarship'),
        ('FREELANCING', 'Freelancing'),
        ('BUSINESS', 'Business'),
        ('OTHER', 'Other'),
    ]

    # Task 2: Fields
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='SALARY')
    description = models.TextField(blank=True, null=True)
    income_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')

    def __str__(self):
        return f"{self.title} - ₹{self.amount} ({self.source})"