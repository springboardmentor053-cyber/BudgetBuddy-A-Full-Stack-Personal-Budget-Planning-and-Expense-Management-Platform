from django.urls import path

from .views import (
    DashboardAPIView,
    ExpenseAnalysisAPIView,
)


urlpatterns = [

    path(
        "dashboard/",
        DashboardAPIView.as_view(),
        name="dashboard",
    ),

    path(
        "expense-analysis/",
        ExpenseAnalysisAPIView.as_view(),
        name="expense-analysis",
    ),
]