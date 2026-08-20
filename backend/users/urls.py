from django.urls import path

from .dashboard_views import TransactionDashboardView
from .ai_views import AIChatPortalView
from .views import (
    ChangePasswordView,
    LoginView,
    RegisterView,
    TokenRefreshView,
    UserProfileView,
)

urlpatterns = [
    # Authentication Endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile & Password Endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Analytics & AI Endpoints
    path('dashboard/', TransactionDashboardView.as_view(), name='transaction_dashboard'),
    path('ai/chat/', AIChatPortalView.as_view(), name='ai_chat'),
]