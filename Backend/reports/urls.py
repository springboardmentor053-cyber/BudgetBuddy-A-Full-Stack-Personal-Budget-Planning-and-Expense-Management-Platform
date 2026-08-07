from django.urls import path
from .views import (
    FinancialSummaryAPIView,
    CategoryAnalysisAPIView,
    MonthlyExpenseTrendAPIView,
    HighestLowestExpenseAPIView,
    DashboardAPIView,
    ExportReportView,  # <--- Make sure this is imported
)
print("REPORTS URLS LOADED")
urlpatterns = [
    path('summary/', FinancialSummaryAPIView.as_view(), name='financial-summary'),
    path('categories/', CategoryAnalysisAPIView.as_view(),
         name='category-analysis'),
    path('monthly-trend/', MonthlyExpenseTrendAPIView.as_view(), name='monthly-trend'),
    path('highlights/', HighestLowestExpenseAPIView.as_view(), name='highest-lowest'),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    # <--- MUST end with trailing slash 'export/'
    path('export-report/', ExportReportView.as_view(), name='export-report'),
]
