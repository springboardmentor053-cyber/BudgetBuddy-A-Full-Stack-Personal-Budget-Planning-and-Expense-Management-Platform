from django.urls import path
from .views import (
    FinancialSummaryAPIView,
    CategoryExpenseAnalysisAPIView,
    MonthlyExpenseTrendAPIView,
    ExpenseExtremesAPIView,
    DashboardAPIView,
    MonthlyFinancialReportAPIView,
    ExpenseReportAPIView,
    SavingsReportAPIView,
    CombinedFinancialSummaryReportAPIView,
)

urlpatterns = [
    # Dashboard & Analytics
    path("summary/", FinancialSummaryAPIView.as_view(), name="financial-summary"),
    path("category-analysis/", CategoryExpenseAnalysisAPIView.as_view(), name="category-analysis"),
    path("monthly-trend/", MonthlyExpenseTrendAPIView.as_view(), name="monthly-trend"),
    path("expense-extremes/", ExpenseExtremesAPIView.as_view(), name="expense-extremes"),
    path("dashboard/", DashboardAPIView.as_view(), name="dashboard"),

    # Wingspan Tasks 2 - 7 Endpoints
    path("monthly-report/", MonthlyFinancialReportAPIView.as_view(), name="monthly-report"),
    path("expense-report/", ExpenseReportAPIView.as_view(), name="expense-report"),
    path("savings-report/", SavingsReportAPIView.as_view(), name="savings-report"),
    path("combined-report/", CombinedFinancialSummaryReportAPIView.as_view(), name="combined-report"),
]
