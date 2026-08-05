from django.urls import path
from .views import (
    SavingsGoalListCreateView,
    SavingsGoalRetrieveUpdateDestroyView,
    SavingsGoalProgressAPIView,
    NotificationListCreateAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkAllReadAPIView,
    NotificationDestroyAPIView,
    AnalyticsAPIView,
    ReportAPIView,
)

urlpatterns = [
    # Savings Goal Endpoints
    path('savings/', SavingsGoalListCreateView.as_view(), name='savings-list-create'),
    path('savings/progress/', SavingsGoalProgressAPIView.as_view(), name='savings-progress'),
    path('savings/<int:pk>/', SavingsGoalRetrieveUpdateDestroyView.as_view(), name='savings-detail'),

    # Notification Endpoints
    path('notifications/', NotificationListCreateAPIView.as_view(), name='notification-list-create'),
    path('notifications/mark-all-read/', NotificationMarkAllReadAPIView.as_view(), name='notification-mark-all-read'),
    path('notifications/<int:pk>/read/', NotificationMarkReadAPIView.as_view(), name='notification-mark-read'),
    path('notifications/<int:pk>/', NotificationDestroyAPIView.as_view(), name='notification-delete'),

    # Analytics Endpoint
    path('analytics/', AnalyticsAPIView.as_view(), name='analytics'),

    # Report Endpoint
    path('reports/', ReportAPIView.as_view(), name='reports'),
]

