from django.db import models
from django.contrib.auth.models import User

class Budget(models.Model):
    category = models.CharField(max_length=100)
    budget_amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.IntegerField()  # e.g., 1 to 12
    year = models.IntegerField()   # e.g., 2026
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_budgets')
    last_alert_threshold=models.IntegerField(default=0)
    class Meta:
        # Task 5: Prevent duplicate budgets for the same category, month, and year for a user
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.category} ({self.month}/{self.year}) - ₹{self.budget_amount}"