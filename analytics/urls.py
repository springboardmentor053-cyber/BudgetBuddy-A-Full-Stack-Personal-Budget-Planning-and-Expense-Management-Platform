from django.urls import path

from .views import (
    financial_summary,
    category_expense_analysis,
    monthly_expense_trend,
    expense_statistics,
    dashboard,
)

urlpatterns = [

    path(
        "analytics/summary/",
        financial_summary,
        name="financial-summary",
    ),

    path(
        "analytics/category-analysis/",
        category_expense_analysis,
        name="category-analysis",
    ),

    path(
        "analytics/monthly-trend/",
        monthly_expense_trend,
        name="monthly-trend",
    ),

    path(
        "analytics/expense-statistics/",
        expense_statistics,
        name="expense-statistics",
    ),

    path(
        "dashboard/",
        dashboard,
        name="dashboard",
    ),
]