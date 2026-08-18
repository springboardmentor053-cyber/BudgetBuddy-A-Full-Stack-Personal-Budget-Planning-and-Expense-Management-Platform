from django.urls import path
from .views import (
    SavingsGoalListCreateView,
    SavingsGoalDetailView,
    SavingsProgressView,
    SavingsDashboardView,
)

urlpatterns = [

    path(
        "",
        SavingsGoalListCreateView.as_view()
    ),

    path(
        "<int:pk>/",
        SavingsGoalDetailView.as_view()
    ),
    path(
    "<int:pk>/progress/",
    SavingsProgressView.as_view()
    ),
    path(
    "dashboard/",
    SavingsDashboardView.as_view(),
),

]