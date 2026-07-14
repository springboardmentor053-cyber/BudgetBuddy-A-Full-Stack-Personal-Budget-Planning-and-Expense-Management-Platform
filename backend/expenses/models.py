from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('shopping', 'Shopping'),
        ('education', 'Education'),
        ('entertainment', 'Entertainment'),
        ('healthcare', 'Healthcare'),
        ('bills', 'Bills'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='miscellaneous')
    description = models.TextField(blank=True, null=True)
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"


class Income(models.Model):
    SOURCE_CHOICES = [
        ('pocket_money', 'Pocket Money'),
        ('scholarship', 'Scholarship'),
        ('freelance', 'Freelance'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='other')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source} - {self.amount}"