from django.urls import path
from .views import (
    MonthlyFinancialReportView,
    ExpenseReportView,
    SavingsReportView,
    ComprehensiveSummaryReportView,
    ExportPDFReportView,
    EmailPDFReportView
)

urlpatterns = [
    path('monthly/', MonthlyFinancialReportView.as_view(), name='monthly-report'),
    path('expenses/', ExpenseReportView.as_view(), name='expense-report'),
    path('savings/', SavingsReportView.as_view(), name='savings-report'),
    path('summary/', ComprehensiveSummaryReportView.as_view(), name='comprehensive-summary-report'),
    path('export-pdf/', ExportPDFReportView.as_view(), name='export-pdf-report'),
    path('email-pdf/', EmailPDFReportView.as_view(), name='email-pdf-report'), # Email PDF Feature
]