from django.db import models
from django.contrib.auth.models import User

SOURCE_CHOICES = [
    ('SALARY', 'Salary'),
    ('POCKET_MONEY', 'Pocket Money'),
    ('SCHOLARSHIP', 'Scholarship'),
    ('FREELANCING', 'Freelancing'),
    ('BUSINESS', 'Business'),
    ('OTHER', 'Other'),
]


class Income(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='income')
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    description = models.TextField(blank=True, null=True)
    income_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
