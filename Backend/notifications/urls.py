from django.urls import path

from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    MarkNotificationReadAPIView,
)

urlpatterns = [

    # CRUD APIs
    path(
        '',
        NotificationListCreateView.as_view(),
        name='notification-list-create'
    ),

    path(
        '<int:pk>/',
        NotificationDetailView.as_view(),
        name='notification-detail'
    ),

    # Mark Notification as Read API
    path(
        '<int:pk>/mark-read/',
        MarkNotificationReadAPIView.as_view(),
        name='notification-mark-read'
    ),

]