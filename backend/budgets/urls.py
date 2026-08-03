from django.urls import path
from .views import (
    BudgetListCreateView,
    BudgetDetailView,
    BudgetSummaryView,
    TransactionDashboardView,
    BudgetAlertStatusView,
)

urlpatterns = [
    path('', BudgetListCreateView.as_view(), name='budget-list-create'),
    path('<int:pk>/', BudgetDetailView.as_view(), name='budget-detail'),
    path('<int:pk>/summary/', BudgetSummaryView.as_view(), name='budget-summary'),
    path('dashboard/', TransactionDashboardView.as_view(), name='transaction-dashboard'),
    path('alerts/status/', BudgetAlertStatusView.as_view(), name='budget-alert-status'),
]