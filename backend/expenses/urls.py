from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseRetrieveUpdateDestroyView,
    TotalExpenseAPIView,
    IncomeListCreateView,
    IncomeRetrieveUpdateDestroyView,
    BudgetListCreateView,
    BudgetRetrieveUpdateDestroyView,
    DashboardAPIView,
    user_profile_view,
)

urlpatterns = [
    # User Profile Endpoint
    path('user/profile/', user_profile_view, name='user-profile'),

    # Expense Endpoints
    path('expenses/total/', TotalExpenseAPIView.as_view(), name='expense-total'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<int:pk>/', ExpenseRetrieveUpdateDestroyView.as_view(), name='expense-detail'),

    # Income Endpoints
    path('income/', IncomeListCreateView.as_view(), name='income-list-create'),
    path('income/<int:pk>/', IncomeRetrieveUpdateDestroyView.as_view(), name='income-detail'),

    # Budget Endpoints
    path('budgets/', BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/<int:pk>/', BudgetRetrieveUpdateDestroyView.as_view(), name='budget-detail'),

    # Dashboard Endpoint
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
]
