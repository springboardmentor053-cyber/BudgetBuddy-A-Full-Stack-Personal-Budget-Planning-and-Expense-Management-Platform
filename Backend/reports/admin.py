from django.contrib import admin

from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "month",
        "total_income",
        "total_expense",
        "savings",
        "created_at",
    )

    list_filter = (
        "month",
        "created_at",
    )

    search_fields = (
        "user__username",
        "month",
    )