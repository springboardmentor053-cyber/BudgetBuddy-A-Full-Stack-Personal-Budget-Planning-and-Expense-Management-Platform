# budgets/models.py
from django.db import models
from django.contrib.auth.models import User

class Budget(models.Model):
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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # If you want current_amount as a field on the database, put it here:
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

    # The __str__ method must end cleanly on its own line
    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.month}/{self.year}): {self.budget_amount}"