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
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    
    # Task 3: Flags to track triggered alerts and prevent duplicates
    alert_80_sent = models.BooleanField(default=False)
    alert_90_sent = models.BooleanField(default=False)
    alert_100_sent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.month}/{self.year}): {self.budget_amount}"

    def reset_alerts(self):
        """Resets flags when budget amount is modified or new month starts."""
        self.alert_80_sent = False
        self.alert_90_sent = False
        self.alert_100_sent = False
        self.save()