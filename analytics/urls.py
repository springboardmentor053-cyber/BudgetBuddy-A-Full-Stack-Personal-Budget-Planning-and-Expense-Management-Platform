from django.urls import path
from .views import (
    FinancialSummaryView,
    CategoryExpenseAnalysisView,
    MonthlyExpenseTrendView,
    ExpenseExtremesView,
    AnalyticsDashboardView
)

urlpatterns = [
    path('financial-summary/', FinancialSummaryView.as_view(), name='financial-summary'),
    path('category-expenses/', CategoryExpenseAnalysisView.as_view(), name='category-expenses'),
    path('monthly-trends/', MonthlyExpenseTrendView.as_view(), name='monthly-trends'),
    path('expense-extremes/', ExpenseExtremesView.as_view(), name='expense-extremes'),
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]
