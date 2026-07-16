from django.urls import path
from .views import IncomeListCreateView, IncomeRetrieveUpdateDestroyView, IncomeExpenseSummaryView

urlpatterns = [
    path("", IncomeListCreateView.as_view(), name="income-list-create"),
    path("summary/", IncomeExpenseSummaryView.as_view(), name="income-summary"),
    path("<int:pk>/", IncomeRetrieveUpdateDestroyView.as_view(), name="income-detail"),
]
