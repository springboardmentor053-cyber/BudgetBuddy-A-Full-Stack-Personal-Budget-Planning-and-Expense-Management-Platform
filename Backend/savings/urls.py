from django.urls import path
from .views import (
    SavingsGoalListCreateAPIView,
    SavingsGoalDetailAPIView,
    GoalProgressAPIView,
)

urlpatterns = [
    path(
        "",
        SavingsGoalListCreateAPIView.as_view(),
        name="savings-list-create",
    ),

    path(
        "<int:pk>/",
        SavingsGoalDetailAPIView.as_view(),
        name="savings-detail",
    ),

    path(
        "progress/",
        GoalProgressAPIView.as_view(),
        name="goal-progress",
    ),
]
