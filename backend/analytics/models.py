from django.db import models
from expenses.models import Expense

class AnalyticsReport(Expense):
    class Meta:
        proxy = True
        verbose_name = "Analytics Overview"
        verbose_name_plural = "Analytics Overview"