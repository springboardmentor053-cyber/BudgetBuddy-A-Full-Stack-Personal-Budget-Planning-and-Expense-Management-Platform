from django.urls import path
from .views import (
    NotificationListCreateAPIView,
    NotificationDetailAPIView,
    MarkNotificationAsReadAPIView,
)

urlpatterns = [
    path(
        "",
        NotificationListCreateAPIView.as_view(),
        name="notification-list-create",
    ),

    path(
        "<int:pk>/read/",
        MarkNotificationAsReadAPIView.as_view(),
        name="notification-read",
    ),
    path(
        "<int:pk>/",
        NotificationDetailAPIView.as_view(),
        name="notification-detail",
    ),
]
