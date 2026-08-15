from django.urls import path

from .views import (
    IncomeListCreateView,
    IncomeDetailView,
    FinancialSummaryView,
)


urlpatterns = [

    path(
        "",
        IncomeListCreateView.as_view(),
        name="income-list-create"
    ),

    path(
        "<int:pk>/",
        IncomeDetailView.as_view(),
        name="income-detail"
    ),

    path(
        "summary/",
        FinancialSummaryView.as_view(),
        name="income-summary"
    ),

]