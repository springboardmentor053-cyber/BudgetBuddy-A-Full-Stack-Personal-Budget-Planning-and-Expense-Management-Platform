from django.urls import path
from .views import (
    NotificationListCreateView,
    NotificationRetrieveUpdateDestroyView,
    NotificationMarkReadView
)

urlpatterns = [
    path("", NotificationListCreateView.as_view(), name="notification-list-create"),
    path("<int:pk>/", NotificationRetrieveUpdateDestroyView.as_view(), name="notification-detail"),
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
]
