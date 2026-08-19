from django.urls import path

from .views import (
    FinancialSummaryView,
    CategoryExpenseAnalysisView,
    MonthlyExpenseTrendView,
    IncomeExpenseTrendView,
    BudgetUtilizationView,
    SavingsGoalProgressView,
    AnalyticsDashboardView,
)


urlpatterns = [

    # =====================================================
    # FINANCIAL SUMMARY
    # =====================================================

    path(
        "summary/",
        FinancialSummaryView.as_view(),
        name="financial-summary"
    ),


    # =====================================================
    # CATEGORY EXPENSES
    # =====================================================

    path(
        "expenses-by-category/",
        CategoryExpenseAnalysisView.as_view(),
        name="expenses-by-category"
    ),


    # =====================================================
    # MONTHLY EXPENSE TREND
    # =====================================================

    path(
        "monthly-expenses/",
        MonthlyExpenseTrendView.as_view(),
        name="monthly-expenses"
    ),


    # =====================================================
    # INCOME VS EXPENSE
    # =====================================================

    path(
        "income-vs-expense/",
        IncomeExpenseTrendView.as_view(),
        name="income-vs-expense"
    ),


    # =====================================================
    # BUDGET UTILIZATION
    # =====================================================

    path(
        "budget-utilization/",
        BudgetUtilizationView.as_view(),
        name="budget-utilization"
    ),


    # =====================================================
    # SAVINGS GOAL PROGRESS
    # =====================================================

    path(
        "savings-progress/",
        SavingsGoalProgressView.as_view(),
        name="savings-progress"
    ),


    # =====================================================
    # COMPLETE ANALYTICS DASHBOARD
    # =====================================================

    path(
        "dashboard/",
        AnalyticsDashboardView.as_view(),
        name="analytics-dashboard"
    ),

]