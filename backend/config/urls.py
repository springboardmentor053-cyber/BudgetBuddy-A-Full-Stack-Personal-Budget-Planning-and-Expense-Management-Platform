from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import RegisterView, LogoutView, ProtectedTestView
from expenses.views import ExpenseListCreateView, ExpenseDetailView, ExpenseTotalView # Added imports

urlpatterns = [
    path('', TokenObtainPairView.as_view(), name='root_token_obtain_pair'),
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/test-secure/', ProtectedTestView.as_view(), name='test_secure'),
    
    # Expenses Core (List, Create, Filter, Sort)
    path('api/expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    
    # Expenses Detail (Update, Delete)
    path('api/expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    
    # Expenses Aggregates (Total)
    path('api/expenses/total/', ExpenseTotalView.as_view(), name='expense_total'),
]