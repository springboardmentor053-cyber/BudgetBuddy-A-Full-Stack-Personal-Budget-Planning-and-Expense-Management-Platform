from django.contrib import admin
from .models import Budget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('category', 'budget_amount', 'month', 'year', 'user')
    list_filter = ('month', 'year', 'category')