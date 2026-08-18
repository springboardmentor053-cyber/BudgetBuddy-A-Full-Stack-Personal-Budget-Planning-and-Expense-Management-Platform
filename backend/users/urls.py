from django.urls import path

from .dashboard_views import TransactionDashboardView
from .views import (
    ChangePasswordView,
    LoginView,
    RegisterView,
    TokenRefreshView,
    UserProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('dashboard/', TransactionDashboardView.as_view(), name='transaction-dashboard'),
]