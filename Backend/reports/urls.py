from django.urls import path

from .views import (
    MonthlyFinancialReportAPIView,
    ExpenseReportAPIView,
    SavingsReportAPIView,
    FinancialSummaryReportAPIView,

)

urlpatterns = [

    # ==========================================
    # Monthly Financial Report API
    # ==========================================
    path(
        "monthly-report/",
        MonthlyFinancialReportAPIView.as_view(),
        name="monthly-report"
    ),

    # ==========================================
    # Expense Report API
    # ==========================================
    path(
        "expense-report/",
        ExpenseReportAPIView.as_view(),
        name="expense-report"
    ),

    # ==========================================
    # Savings Report API
    # ==========================================
    path(
        "savings-report/",
        SavingsReportAPIView.as_view(),
        name="savings-report"
    ),
    path(
        "financial-summary-report/",
        FinancialSummaryReportAPIView.as_view(),
        name="financial-summary-report"
    ),

]