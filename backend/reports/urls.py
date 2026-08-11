from django.urls import path

from .views import (
    CategoryExpenseAnalysisAPIView,
    DashboardAPIView,
    FinancialSummaryView,
    FinancialSummaryReportAPIView,
    IncomeExpenseComparisonAPIView,
    MonthlyExpenseTrendAPIView,
    MonthlyFinancialReportAPIView,
    SavingsReportAPIView,
    ExpenseReportAPIView,
    DownloadPDFReportAPIView,
)


urlpatterns = [
    path(
        "financial-summary/",
        FinancialSummaryView.as_view(),
        name="financial-summary",
    ),

    path(
        "dashboard/",
        DashboardAPIView.as_view(),
        name="dashboard",
    ),

    path(
        "monthly-expense-trend/",
        MonthlyExpenseTrendAPIView.as_view(),
        name="monthly-expense-trend",
    ),

    path(
        "category-expenses/",
        CategoryExpenseAnalysisAPIView.as_view(),
        name="category-expenses",
    ),

    path(
        "income-vs-expense/",
        IncomeExpenseComparisonAPIView.as_view(),
        name="income-vs-expense",
    ),

    path(
        "savings-report/",
        SavingsReportAPIView.as_view(),
        name="savings-report",
    ),

    path(
        "expense-report/",
        ExpenseReportAPIView.as_view(),
        name="expense-report",
    ),

    path(
        "monthly-report/",
        MonthlyFinancialReportAPIView.as_view(),
        name="monthly-report",
    ),

    path(
        "financial-summary-report/",
        FinancialSummaryReportAPIView.as_view(),
        name="financial-summary-report",
    ),

    path(
        "report/pdf/",
        DownloadPDFReportAPIView.as_view(),
        name="download-pdf-report",
    ),
]