from django.urls import path
from .views import (
    MonthlyFinancialReportView,
    ExpenseReportView,
    SavingsReportView,
    CombinedFinancialSummaryReportView,
    ExportReportView,
    ExportPDFReportView,
    ExportExcelReportView,
)

urlpatterns = [
    # Main legacy endpoint preserve
    path('', CombinedFinancialSummaryReportView.as_view(), name='report-legacy-summary'),

    # Monthly Financial Report API
    path('monthly/', MonthlyFinancialReportView.as_view(), name='report-monthly'),

    # Expense Report API
    path('expenses/', ExpenseReportView.as_view(), name='report-expenses'),

    # Savings Report API
    path('savings/', SavingsReportView.as_view(), name='report-savings'),

    # Combined Summary API
    path('summary/', CombinedFinancialSummaryReportView.as_view(), name='report-summary'),

    # Official Export Endpoints (Module 9 Specification)
    path('export/pdf/', ExportPDFReportView.as_view(), name='report-export-pdf'),
    path('export/excel/', ExportExcelReportView.as_view(), name='report-export-excel'),

    # Legacy & General Export Endpoint
    path('export/', ExportReportView.as_view(), name='report-export'),
]
