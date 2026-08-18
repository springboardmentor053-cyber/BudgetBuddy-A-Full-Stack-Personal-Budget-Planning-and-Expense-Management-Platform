from django.urls import path
from .views import (
    FinancialSummaryAPIView,
    CategoryAnalysisAPIView,
    MonthlyExpenseTrendAPIView,
    ExpenseStatisticsAPIView,
    DashboardAPIView,
)

urlpatterns = [
    path("summary/", FinancialSummaryAPIView.as_view()),
    path("category-analysis/", CategoryAnalysisAPIView.as_view()),
    path(
    "monthly-trend/",
    MonthlyExpenseTrendAPIView.as_view(),
),
    path("expense-statistics/", ExpenseStatisticsAPIView.as_view()),
    path("dashboard/", DashboardAPIView.as_view()),
]