# savings/urls.py
from django.urls import path
from .views import SavingsGoalListCreateView, SavingsGoalDetailView

urlpatterns = [
    path('', SavingsGoalListCreateView.as_view(), name='savings-list-create'),
    path('<int:pk>/', SavingsGoalDetailView.as_view(), name='savings-detail'),
]