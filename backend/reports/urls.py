from django.urls import path
from .views import (
    MonthlyFinancialReportView,
    ExpenseReportView,
    SavingsReportView,
    FinancialSummaryReportView
)

urlpatterns = [
    path('monthly-financial/', MonthlyFinancialReportView.as_view(), name='monthly-financial-report'),
    path('expenses-range/', ExpenseReportView.as_view(), name='expense-report'),
    path('savings/', SavingsReportView.as_view(), name='savings-report'),
    path('financial-summary/', FinancialSummaryReportView.as_view(), name='financial-summary-report'),
]