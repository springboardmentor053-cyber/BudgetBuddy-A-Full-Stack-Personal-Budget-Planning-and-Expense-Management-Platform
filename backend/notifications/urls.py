# notifications/urls.py
from django.urls import path
from .views import (
    NotificationListCreateView, 
    NotificationDetailView, 
    MarkNotificationAsReadView
)

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:pk>/read/', MarkNotificationAsReadView.as_view(), name='notification-mark-as-read'),
]