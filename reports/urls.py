from django.urls import path
from .views import (
    DashboardSummaryView,
    ReportHistoryListView,
    MonthlyFinancialReportView,
    ExpenseReportView,
    SavingsReportView,
    CombinedFinancialReportView,
    ExportReportView
)

urlpatterns = [
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("history/", ReportHistoryListView.as_view(), name="report-history"),
    path("monthly-financial/", MonthlyFinancialReportView.as_view(), name="monthly-financial-report"),
    path("expenses/", ExpenseReportView.as_view(), name="expense-report"),
    path("savings/", SavingsReportView.as_view(), name="savings-report"),
    path("financial-summary-report/", CombinedFinancialReportView.as_view(), name="combined-financial-report"),
    path("export/", ExportReportView.as_view(), name="export-report"),
]
