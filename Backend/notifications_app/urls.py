from django.urls import path
from .views import (
    MarkAllNotificationsReadView,
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
        "<int:pk>/mark-read/",
        MarkNotificationAsReadAPIView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "<int:pk>/",
        NotificationDetailAPIView.as_view(),
        name="notification-detail",
    ),
    # notifications_app/urls.py
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(),
         name='mark-all-read'),
]
