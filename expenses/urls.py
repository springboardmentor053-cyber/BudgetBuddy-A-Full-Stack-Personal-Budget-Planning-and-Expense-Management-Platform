from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseRetrieveUpdateDestroyView,
    TotalExpenseView,
)

urlpatterns = [

    path(
        "",
        ExpenseListCreateView.as_view(),
        name="expense-list",
    ),

    path(
        "<int:pk>/",
        ExpenseRetrieveUpdateDestroyView.as_view(),
        name="expense-detail",
    ),

    path(
        "total/",
        TotalExpenseView.as_view(),
        name="total-expense",
    ),
]