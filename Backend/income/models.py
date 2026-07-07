from django.db import models
from django.contrib.auth.models import User


class Income(models.Model):

    INCOME_TYPES = [
        ('Pocket Money', 'Pocket Money'),
        ('Scholarship', 'Scholarship'),
        ('Freelance', 'Freelance'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='incomes'
    )

    source = models.CharField(max_length=100)

    income_type = models.CharField(
        max_length=20,
        choices=INCOME_TYPES,
        default='Pocket Money'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.source} - ₹{self.amount}"
