# C:\Users\Anagha\OneDrive\Desktop\BudgetBuddy\backend\urls.py

from django.contrib import admin
from django.urls import path, include  # Added 'include' here
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import RegisterView, LogoutView, ProtectedTestView
from expenses.views import ExpenseListCreateView, ExpenseDetailView, ExpenseTotalView 

# Import Income views
from income.views import IncomeViewSet

# Import Budget views & the new Transaction Dashboard API
from budgets.views import (
    BudgetListCreateView, 
    BudgetDetailView, 
    BudgetSummaryView, 
    TransactionDashboardView
)

# Bind the ViewSet methods to standard REST API actions
income_list = IncomeViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

income_detail = IncomeViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('', TokenObtainPairView.as_view(), name='root_token_obtain_pair'),
    path('admin/', admin.site.urls),
    
    # ==================== AUTHENTICATION ENDPOINTS ====================
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/test-secure/', ProtectedTestView.as_view(), name='test_secure'),
    
    # ==================== EXPENSE MODULE ENDPOINTS ====================
    # Expenses Core (List, Create, Filter, Sort)
    path('api/expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    
    # Expenses Detail (Update, Delete)
    path('api/expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    
    # Expenses Aggregates (Total)
    path('api/expenses/total/', ExpenseTotalView.as_view(), name='expense_total'),

    # ==================== INCOME MODULE ENDPOINTS ====================
    # Income Core (List all, Create new log)
    path('api/income/', income_list, name='income_list_create'),
    
    # Income Detail (Get specific log, Update/Edit it, Delete it)
    path('api/income/<int:pk>/', income_detail, name='income_detail'),
    
    # ==================== BUDGET MODULE ENDPOINTS ====================
    # Budget Core (List, Create)
    path('api/budgets/', BudgetListCreateView.as_view(), name='budget_list_create'),
    
    # Budget Detail (Retrieve, Update, Delete)
    path('api/budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget_detail'),
    
    # Specific Budget Category Summary (Budget, Expenses, Remaining, Overspent)
    path('api/budgets/<int:pk>/summary/', BudgetSummaryView.as_view(), name='budget_summary'),

    # ==================== UNIFIED DASHBOARD ENDPOINT ====================
    # Global Transaction Dashboard (Income, Expense, Balance, Budgets, and Recent Transactions)
    path('api/summary/', TransactionDashboardView.as_view(), name='transaction_dashboard'),

    # ==================== SAVINGS GOALS ENDPOINTS ====================
    path('api/savings/', include('savings.urls')),

# ==================== NOTIFICATIONS ENDPOINTS ====================
    path('api/notifications/', include('notifications.urls')),
    path('api/users/', include('users.urls'))
]