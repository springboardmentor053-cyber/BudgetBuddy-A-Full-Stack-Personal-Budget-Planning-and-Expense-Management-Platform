from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    accent_color = models.CharField(
    max_length=20,
    default="indigo"
    )
    monthly_income = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    currency = models.CharField(
        max_length=10,
        default="INR"
    )

    phone_number = models.CharField(
        max_length=15,
        blank=True
    )
    bio = models.TextField(
    blank=True,
    default=""
    )

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.username
