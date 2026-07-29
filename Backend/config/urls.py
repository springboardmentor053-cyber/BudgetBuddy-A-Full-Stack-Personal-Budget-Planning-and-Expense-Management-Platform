from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/users/", include("users.urls")),
    path("api/income/", include("income.urls")),
    path("api/expenses/", include("expenses.urls")),
    path('api/dashboard/', include('dashboard.urls')),
    path("api/budgets/", include("budgets.urls")),
    path("api/savings/", include("savings.urls")),
    path("api/notifications/", include("notifications_app.urls")),
    path("api/analytics/", include("analytics_app.urls")),
    path("api/reports/", include("reports.urls")),
    # path("api/profile/", include("profile.urls")),


    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
