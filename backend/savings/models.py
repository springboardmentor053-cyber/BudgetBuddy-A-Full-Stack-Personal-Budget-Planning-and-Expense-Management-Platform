from django.db import models

from django.db import models
from django.conf import settings

class Savings(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    target_name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_saved = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
