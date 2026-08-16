from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    # =================================================
    # ADMIN
    # =================================================

    path(
        "admin/",
        admin.site.urls,
    ),

    # =================================================
    # AUTHENTICATION
    # =================================================

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

    # =================================================
    # USERS
    # =================================================

    path(
        "api/users/",
        include("users.urls"),
    ),

    # =================================================
    # ANALYTICS
    # =================================================

    path(
        "api/analytics/",
        include("analytics.urls"),
    ),

    # =================================================
    # OTHER APPS
    # =================================================

    path(
        "api/incomes/",
        include("income.urls"),
    ),

    path(
        "api/expenses/",
        include("expenses.urls"),
    ),

    path(
        "api/budgets/",
        include("budgets.urls"),
    ),

    path(
        "api/notifications/",
        include("notifications.urls"),
    ),

    # =================================================
    # REPORTS
    # =================================================

    path(
        "api/reports/",
        include("reports.urls"),
    ),

    # =================================================
    # API DOCUMENTATION
    # =================================================

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
]