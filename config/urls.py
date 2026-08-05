from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from expenses.views import register_user, get_status

urlpatterns = [
    path('admin/', admin.site.urls),
    path('get/', get_status, name='get_status'),
    path('api/register/', register_user, name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/reports/', include('reports.urls')),
    path('api/', include('expenses.urls')),
    path('api/', include('savings.urls')),
]
