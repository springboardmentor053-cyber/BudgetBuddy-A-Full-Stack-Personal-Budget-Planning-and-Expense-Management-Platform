from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    # API documentation
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(
            url_name="schema"
        ),
        name="redoc",
    ),

    # Application APIs
    path(
        "api/",
        include("users.urls"),
    ),
    path(
        "api/",
        include("notifications.urls"),
    ),
    path(
        "api/",
        include("income.urls"),
    ),
    path(
        "api/",
        include("expenses.urls"),
    ),
    path(
        "api/",
        include("budgets.urls"),
    ),
    path(
        "api/",
        include("reports.urls"),
    ),

    # JWT authentication
    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
    "api/analytics/",
    include("analytics.urls"),
),
    # Analytics APIs
path(
    "api/analytics/",
    include("analytics.urls"),
),

# JWT authentication
path(
    "api/token/",
    TokenObtainPairView.as_view(),
    name="token_obtain_pair",
),

path(
    "api/token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh",
),
path(
    "api/reports/",
    include("reports.urls"),
),
]