from django.urls import path
from .views import (
    FinancialAnalyticsAPIView,
    BudgetAlertAPIView,
    FinancialReportAPIView,
)

urlpatterns = [
    path(
        "",
        FinancialAnalyticsAPIView.as_view(),
        name="financial-analytics",
    ),

    path(
        "budget-alerts/",
        BudgetAlertAPIView.as_view(),
        name="budget-alerts",
    ),
    path(
        "report/",
        FinancialReportAPIView.as_view(),
        name="financial-report",
    ),
]
