from django.contrib import admin
from .models import AnalyticsReport

@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    # Prevents adding or deleting through this view
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False