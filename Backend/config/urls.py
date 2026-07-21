from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


def home(request):
    return HttpResponse("BudgetBuddy Backend Running Successfully!")


urlpatterns = [
    path('', home),

    # Admin
    path('admin/', admin.site.urls),

    # User APIs
    path('api/users/', include('users.urls')),

    # Expense APIs
    path('api/', include('expenses.urls')),

    # Income APIs
    path('api/', include('income.urls')),

    # Budget APIs
    path('api/', include('budgets.urls')),

    # Dashboard API
    path('api/', include('dashboard.urls')),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]