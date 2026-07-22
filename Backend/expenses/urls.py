from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseRetrieveUpdateDestroyView,
    ExpenseCategorySummaryView,
    TotalExpenseView,
)

urlpatterns = [
    path(
        "",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),

    path(
        "<int:pk>/",
        ExpenseRetrieveUpdateDestroyView.as_view(),
        name="expense-detail",
    ),

    path(
        "category-summary/",
        ExpenseCategorySummaryView.as_view(),
        name="expense-category-summary",
    ),

    path(
        "total/",
        TotalExpenseView.as_view(),
        name="total-expense",
    ),
]
