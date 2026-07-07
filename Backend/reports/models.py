from django.db import models
from django.contrib.auth.models import User


class Report(models.Model):

    REPORT_TYPES = [
        ('Monthly', 'Monthly'),
        ('Yearly', 'Yearly'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reports'
    )

    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPES
    )

    total_income = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_expense = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_savings = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.report_type}"
