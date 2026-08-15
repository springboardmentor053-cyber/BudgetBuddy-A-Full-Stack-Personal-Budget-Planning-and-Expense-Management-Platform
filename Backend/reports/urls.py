from django.urls import path

from .views import (
    DashboardView,
    GenerateReportView,
    MonthlyFinancialReportView,
    ExpenseReportView,
    SavingsReportView,
    FinancialSummaryReportView,
)


urlpatterns = [

    path(
        "",
        DashboardView.as_view(),
        name="reports-dashboard"
    ),

    path(
        "generate/",
        GenerateReportView.as_view(),
        name="generate-report"
    ),

    path(
        "monthly/",
        MonthlyFinancialReportView.as_view(),
        name="monthly-financial-report"
    ),

    path(
        "expenses/",
        ExpenseReportView.as_view(),
        name="expense-report"
    ),

    path(
        "savings/",
        SavingsReportView.as_view(),
        name="savings-report"
    ),

    path(
        "summary/",
        FinancialSummaryReportView.as_view(),
        name="financial-summary-report"
    ),

]