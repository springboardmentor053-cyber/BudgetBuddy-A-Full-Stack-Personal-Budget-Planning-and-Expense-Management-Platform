from django.db import models
from django.contrib.auth.models import User

class Budget(models.Model):
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='miscellaneous')
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.IntegerField()
    year = models.IntegerField()
    alert_80_sent = models.BooleanField(default=False)
    alert_90_sent = models.BooleanField(default=False)
    alert_100_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.category} - {self.budget_amount} ({self.month}/{self.year})"


class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    title = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.saved_amount}/{self.target_amount}"