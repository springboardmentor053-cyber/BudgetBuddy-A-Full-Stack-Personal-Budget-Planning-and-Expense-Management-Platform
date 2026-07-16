from django.urls import path
from .views import BudgetListCreateView, BudgetRetrieveUpdateDestroyView

urlpatterns = [
    path("", BudgetListCreateView.as_view(), name="budget-list-create"),
    path("<int:pk>/", BudgetRetrieveUpdateDestroyView.as_view(), name="budget-detail"),
]
