from django.urls import path
from .views import (
    BudgetListCreateView,
    BudgetRetrieveUpdateDestroyView,
    BudgetSummaryAPIView,
    BudgetAlertView,
)

urlpatterns = [
    path("", BudgetListCreateView.as_view(), name="budget-list-create"),
    path("<int:pk>/", BudgetRetrieveUpdateDestroyView.as_view(), name="budget-detail"),
    path("budget-summary/", BudgetSummaryAPIView.as_view(), name="budget-summary"),
    path("budget-alerts/", BudgetAlertView.as_view(), name="budget-alerts"),
]
