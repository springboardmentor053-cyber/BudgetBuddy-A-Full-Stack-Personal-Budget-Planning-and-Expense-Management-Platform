from django.urls import path

from .views import (
    BudgetListCreateView,
    BudgetRetrieveUpdateDestroyView,
    BudgetSummaryView,
)

urlpatterns = [

    path(
        "",
        BudgetListCreateView.as_view(),
        name="budget-list",
    ),

    path(
        "summary/",
        BudgetSummaryView.as_view(),
        name="budget-summary",
    ),

    path(
        "<int:pk>/",
        BudgetRetrieveUpdateDestroyView.as_view(),
        name="budget-detail",
    ),

]