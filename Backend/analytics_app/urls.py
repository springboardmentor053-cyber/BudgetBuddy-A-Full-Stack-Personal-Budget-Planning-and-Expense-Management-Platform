from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.DashboardAPIView.as_view(), name="dashboard"),
    path("summary/", views.FinancialSummaryAPIView.as_view(), name="summary"),
    path("category/", views.CategoryAnalysisAPIView.as_view(), name="category"),
    path("monthly-trend/", views.MonthlyExpenseTrendAPIView.as_view(), name="monthly-trend"),
    path("insights/", views.HighestLowestExpenseAPIView.as_view(), name="insights"),
    path("export/", views.ExportReportAPIView.as_view(), name="export"),
]