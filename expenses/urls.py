from django.urls import path
from .views import ExpenseListCreateView, ExpenseRetrieveUpdateDestroyView, ExpenseTotalView

urlpatterns = [
    path("", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("total/", ExpenseTotalView.as_view(), name="expense-total"),
    path("<int:pk>/", ExpenseRetrieveUpdateDestroyView.as_view(), name="expense-detail"),
]