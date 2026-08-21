from django.contrib import admin
from .models import SavingsGoal

@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('goal_name', 'user', 'target_amount', 'saved_amount', 'target_date', 'status', 'created_at')
    list_filter = ('status', 'target_date', 'user')
    search_fields = ('goal_name', 'user__username')
