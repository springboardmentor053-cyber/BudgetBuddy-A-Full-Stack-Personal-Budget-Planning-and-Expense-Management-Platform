from django.urls import path

from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseCategoryFilterView,
    ExpenseSortView,
    TotalExpenseView,
)


urlpatterns = [

    path(
        "",
        ExpenseListCreateView.as_view(),
        name="expense-list-create"
    ),

    path(
        "<int:pk>/",
        ExpenseDetailView.as_view(),
        name="expense-detail"
    ),

    path(
        "category/<str:category>/",
        ExpenseCategoryFilterView.as_view(),
        name="expense-category"
    ),

    path(
        "sort/",
        ExpenseSortView.as_view(),
        name="expense-sort"
    ),

    path(
        "total/",
        TotalExpenseView.as_view(),
        name="total-expense"
    ),

]