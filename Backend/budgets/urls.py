from django.urls import path

from .views import (
    BudgetListCreateView,
    BudgetDetailView,
    BudgetSummaryView,
    TransactionDashboardView,
)


urlpatterns = [

    path(
        "",
        BudgetListCreateView.as_view(),
        name="budget-list-create"
    ),

    path(
        "<int:pk>/",
        BudgetDetailView.as_view(),
        name="budget-detail"
    ),

    path(
        "summary/<int:pk>/",
        BudgetSummaryView.as_view(),
        name="budget-summary"
    ),

    path(
        "dashboard/",
        TransactionDashboardView.as_view(),
        name="dashboard"
    ),

]