from django.urls import path
from .views import SavingsGoalListCreateView, SavingsGoalRetrieveUpdateDestroyView

urlpatterns = [
    path("", SavingsGoalListCreateView.as_view(), name="savings-list-create"),
    path("<int:pk>/", SavingsGoalRetrieveUpdateDestroyView.as_view(), name="savings-detail"),
]
