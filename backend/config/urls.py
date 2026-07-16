from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),

    # New separate Income app must come first
    path("api/", include("income.urls")),
    
    path("api/", include("expenses.urls")),
    path("api/", include("budgets.urls")),
    path("api/", include("reports.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]