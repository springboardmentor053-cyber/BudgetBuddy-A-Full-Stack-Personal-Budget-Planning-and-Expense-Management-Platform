from django.db import models
from django.contrib.auth.models import User


class Income(models.Model):

    SOURCE_CHOICES = [
        ('SALARY', 'Salary'),
        ('POCKET_MONEY', 'Pocket Money'),
        ('SCHOLARSHIP', 'Scholarship'),
        ('FREELANCING', 'Freelancing'),
        ('BUSINESS', 'Business'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=100)

    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    description = models.TextField(blank=True)

    income_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"