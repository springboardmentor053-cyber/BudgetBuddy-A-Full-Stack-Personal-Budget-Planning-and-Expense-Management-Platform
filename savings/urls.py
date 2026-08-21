from django.urls import path
from .views import (
    SavingsGoalListCreateView,
    SavingsGoalRetrieveUpdateDestroyView,
    SavingsGoalProgressView
)

urlpatterns = [
    path("", SavingsGoalListCreateView.as_view(), name="savings-list-create"),
    path("<int:pk>/", SavingsGoalRetrieveUpdateDestroyView.as_view(), name="savings-detail"),
    path("<int:pk>/progress/", SavingsGoalProgressView.as_view(), name="savings-progress"),
]
