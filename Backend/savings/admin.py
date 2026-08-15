from django.contrib import admin

from .models import SavingsGoal


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "goal_name",
        "target_amount",
        "saved_amount",
        "deadline",
    )

    list_filter = (
        "deadline",
    )

    search_fields = (
        "user__username",
        "goal_name",
    )