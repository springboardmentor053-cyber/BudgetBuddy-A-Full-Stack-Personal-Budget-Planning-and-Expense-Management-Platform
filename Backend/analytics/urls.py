from django.urls import path

from .views import (
    FinancialSummaryAPIView,
    CategoryExpenseAnalysisAPIView,
    MonthlyExpenseTrendAPIView,
    ExpenseHighlightsAPIView,
    BudgetStatusAPIView,
    SavingsGoalProgressAPIView,
    RecentTransactionsAPIView,
    AnalyticsNotificationsAPIView,
    DashboardAPIView,
)


urlpatterns = [

    # ======================================================
    # FINANCIAL SUMMARY
    # ======================================================

    path(
        "financial-summary/",
        FinancialSummaryAPIView.as_view(),
        name="financial-summary"
    ),

    # ======================================================
    # CATEGORY EXPENSE ANALYSIS
    # ======================================================

    path(
        "category-expense/",
        CategoryExpenseAnalysisAPIView.as_view(),
        name="category-expense"
    ),

    # ======================================================
    # MONTHLY EXPENSE TREND
    # ======================================================

    path(
        "monthly-expense-trend/",
        MonthlyExpenseTrendAPIView.as_view(),
        name="monthly-expense-trend"
    ),

    # ======================================================
    # EXPENSE HIGHLIGHTS
    # ======================================================

    path(
        "expense-highlights/",
        ExpenseHighlightsAPIView.as_view(),
        name="expense-highlights"
    ),

    # ======================================================
    # BUDGET STATUS
    # ======================================================

    path(
        "budget-status/",
        BudgetStatusAPIView.as_view(),
        name="budget-status"
    ),

    # ======================================================
    # SAVINGS GOAL PROGRESS
    # ======================================================

    path(
        "savings-goals/",
        SavingsGoalProgressAPIView.as_view(),
        name="savings-goals"
    ),

    # ======================================================
    # RECENT TRANSACTIONS
    # ======================================================

    path(
        "recent-transactions/",
        RecentTransactionsAPIView.as_view(),
        name="recent-transactions"
    ),

    # ======================================================
    # NOTIFICATIONS / ALERTS
    # ======================================================

    path(
        "notifications/",
        AnalyticsNotificationsAPIView.as_view(),
        name="analytics-notifications"
    ),

    # ======================================================
    # COMPLETE ANALYTICS DASHBOARD
    # ======================================================

    path(
        "dashboard/",
        DashboardAPIView.as_view(),
        name="analytics-dashboard"
    ),

]