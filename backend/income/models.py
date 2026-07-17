from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Income(models.Model):
    class Category(models.TextChoices):
        SALARY = 'SALARY', _('Salary')
        POCKET_MONEY = 'POCKET_MONEY', _('Pocket Money')
        SCHOLARSHIP = 'SCHOLARSHIP', _('Scholarship')
        FREELANCING = 'FREELANCING', _('Freelancing')
        BUSINESS = 'BUSINESS', _('Business')
        OTHER = 'OTHER', _('Other')

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='income_entries')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    description = models.TextField(blank=True, null=True)
    income_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-income_date', '-created_at']

    def __str__(self) -> str:
        return f'{self.user.username} - {self.title} ({self.amount})'
