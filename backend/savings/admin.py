from django.contrib import admin
from .models import SavingsGoal


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'user', 
        'target_amount', 
        'saved_amount', 
        'remaining_amount', 
        'status', 
        'target_date'
    )
    list_filter = ('status', 'target_date')
    search_fields = ('title', 'user__username')
