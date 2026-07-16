from django.urls import path
from .views import DashboardSummaryView, ReportHistoryListView

urlpatterns = [
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("history/", ReportHistoryListView.as_view(), name="report-history"),
]
