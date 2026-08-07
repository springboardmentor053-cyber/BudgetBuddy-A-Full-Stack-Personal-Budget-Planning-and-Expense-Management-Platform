from django.db import models
from django.contrib.auth.models import User


class Budget(models.Model):

    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Travel', 'Travel'),
        ('Shopping', 'Shopping'),
        ('Education', 'Education'),
        ('Entertainment', 'Entertainment'),
        ('Healthcare', 'Healthcare'),
        ('Bills', 'Bills'),
        ('Miscellaneous', 'Miscellaneous'),
    ]



    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="budgets")
    category = models.CharField(max_length=50)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.IntegerField()
    year = models.IntegerField()

    warning_80_sent = models.BooleanField(default=False)
    warning_90_sent = models.BooleanField(default=False)
    warning_100_sent = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.month}/{self.year})"
