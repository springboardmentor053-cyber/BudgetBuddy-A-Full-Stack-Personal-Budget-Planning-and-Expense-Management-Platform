from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


# ============================================================
# HOME
# ============================================================

def home(request):
    return HttpResponse(
        "BudgetBuddy Backend Running Successfully!"
    )


# ============================================================
# URL CONFIGURATION
# ============================================================

urlpatterns = [

    # --------------------------------------------------------
    # Home
    # --------------------------------------------------------
    path(
        '',
        home,
        name='home'
    ),

    # --------------------------------------------------------
    # Django Admin
    # --------------------------------------------------------
    path(
        'admin/',
        admin.site.urls
    ),

    # --------------------------------------------------------
    # User APIs
    # --------------------------------------------------------
    path(
        'api/users/',
        include('users.urls')
    ),

    # --------------------------------------------------------
    # Expense APIs
    # --------------------------------------------------------
    path(
        'api/',
        include('expenses.urls')
    ),

    # --------------------------------------------------------
    # Income APIs
    # --------------------------------------------------------
    path(
        'api/',
        include('income.urls')
    ),

    # --------------------------------------------------------
    # Budget APIs
    # --------------------------------------------------------
    path(
        'api/',
        include('budgets.urls')
    ),

    # --------------------------------------------------------
    # Dashboard APIs
    # --------------------------------------------------------
    path(
        'api/',
        include('dashboard.urls')
    ),

    # --------------------------------------------------------
    # Savings APIs
    # --------------------------------------------------------
    path(
        'api/savings/',
        include('savings.urls')
    ),

    # --------------------------------------------------------
    # Analytics APIs   <-- NEW
    # --------------------------------------------------------
    path(
        'api/analytics/',
        include('analytics.urls')
    ),

    # --------------------------------------------------------
    # Notification APIs
    # --------------------------------------------------------
    path(
        'api/notifications/',
        include('notifications.urls')
    ),

    # --------------------------------------------------------
    # JWT Authentication
    # --------------------------------------------------------
    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
    path(
        'api/reports/',
        include('reports.urls')
    ),

]