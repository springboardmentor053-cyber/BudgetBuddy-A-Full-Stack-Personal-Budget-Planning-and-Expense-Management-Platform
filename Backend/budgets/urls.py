from django.urls import path
from .views import *

urlpatterns = [

    path(
        '',
        BudgetListCreateView.as_view(),
        name='budget-list-create'
    ),

    path(
        '<int:pk>/',
        BudgetDetailView.as_view(),
        name='budget-detail'
    ),

    path(
        'savings/',
        SavingsGoalListCreateView.as_view(),
        name='savings-list-create'
    ),

    path(
        'savings/<int:pk>/',
        SavingsGoalDetailView.as_view(),
        name='savings-detail'
    ),

]