from django.urls import path

from .views import (
    FinancialSummaryView,
    CategoryExpenseAnalysisView,
)


urlpatterns = [

    path(
        "summary/",
        FinancialSummaryView.as_view(),
        name="financial-summary"
    ),

    path(
        "expenses-by-category/",
        CategoryExpenseAnalysisView.as_view(),
        name="expenses-by-category"
    ),

]