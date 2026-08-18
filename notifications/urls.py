from django.urls import path

from .views import (
    NotificationListView,
    NotificationReadView,
    UnreadNotificationCountView,
    MarkAllNotificationsReadView,
)

urlpatterns = [
    path(
        "",
        NotificationListView.as_view(),
        name="notification-list",
    ),

    path(
        "<int:pk>/read/",
        NotificationReadView.as_view(),
        name="notification-read",
    ),

    path(
        "unread-count/",
        UnreadNotificationCountView.as_view(),
        name="unread-count",
    ),
    path(
    "mark-all-read/",
    MarkAllNotificationsReadView.as_view(),
    name="mark-all-read",
),
]