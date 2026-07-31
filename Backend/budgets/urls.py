from django.urls import path
from .views import BudgetSummaryView
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

    path(
    "summary/<int:pk>/",
    BudgetSummaryView.as_view(),
    name="budget-summary"
    ),

    path(
    "dashboard/",
    TransactionDashboardView.as_view(),
    name="dashboard"
    ),

]