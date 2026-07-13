from django.contrib import admin
from .models import UserProfile, Income, Expense, Budget, SavingsGoal, Notification, Report

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model."""
    list_display = ('user', 'phone_number', 'created_at', 'updated_at')
    search_fields = ('user__username', 'phone_number')


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    """Admin configuration for Income model."""
    list_display = ('user', 'source', 'amount', 'income_date')
    list_filter = ('income_date',)
    search_fields = ('user__username', 'source', 'description')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Admin configuration for Expense model."""
    list_display = ('user', 'title', 'amount', 'category', 'expense_date')
    list_filter = ('category', 'expense_date')
    search_fields = ('user__username', 'title', 'description')


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """Admin configuration for Budget model."""
    list_display = ('user', 'category', 'budget_amount', 'month', 'year')
    list_filter = ('category', 'year', 'month')
    search_fields = ('user__username', 'category')


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    """Admin configuration for SavingsGoal model."""
    list_display = ('user', 'name', 'target_amount', 'current_amount', 'target_date')
    list_filter = ('target_date',)
    search_fields = ('user__username', 'name')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin configuration for Notification model."""
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'message')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin configuration for Report model."""
    list_display = ('user', 'title', 'generated_at')
    list_filter = ('generated_at',)
    search_fields = ('user__username', 'title')
