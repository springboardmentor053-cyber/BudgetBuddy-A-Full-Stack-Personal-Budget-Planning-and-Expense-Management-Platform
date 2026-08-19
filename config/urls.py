from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/", include("users.urls")),
    path("api/", include("expenses.urls")),
    path("api/", include("budgets.urls")),
    path("api/", include("income.urls")),
    path("api/savings/", include("savings.urls")),
    path("api/", include("reports.urls")),
    path("api/",include("notifications.urls")),
    path("api/", include("analytics.urls")),

    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )