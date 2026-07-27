from django.urls import path

from .views import (
    IncomeListCreateView,
    IncomeRetrieveUpdateDestroyView,
    TotalIncomeView,
    FinancialSummaryView,
    TransactionDashboardView,
    
)

urlpatterns = [
    path("", IncomeListCreateView.as_view(), name="income-list"),
    path("total/", TotalIncomeView.as_view(), name="total-income"),
    path("<int:pk>/", IncomeRetrieveUpdateDestroyView.as_view(), name="income-detail"),
    path(
    "summary/",
    FinancialSummaryView.as_view(),
    name="financial-summary",
),
path(
    "dashboard/",
    TransactionDashboardView.as_view(),
    name="transaction-dashboard",
),
]