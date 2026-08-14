from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, blank=True)      # <-- Added
    profession = models.CharField(max_length=100, blank=True)    # <-- Added
    monthly_income = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default="INR")
    financial_goal = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
