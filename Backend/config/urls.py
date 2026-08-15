from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import home

urlpatterns = [
    path('', home, name='home'),

    # Admin Panel
    path('admin/', admin.site.urls),

    # Reports App
    path(
    "api/reports/",
    include("reports.urls")
),

     # Analytics App
path(
    "api/analytics/",
    include("analytics.urls")
),

    # Savings App
    path(
    "api/savings/",
    include("savings.urls")
),

    # Users App
    path('api/users/', include('users.urls')),

    # Expense App
    path('api/expenses/', include('expenses.urls')),

    #Users Income
    path('api/income/', include('income.urls')),

    # Notifications App
    path(
    "api/notifications/",
    include("notifications.urls")
),

    #users dashboard
    path('api/dashboard/', include('reports.urls')),

    #budgets
    path('api/budgets/', include('budgets.urls')),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),
]