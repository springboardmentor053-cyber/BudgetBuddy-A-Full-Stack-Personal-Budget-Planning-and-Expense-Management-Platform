from rest_framework import generics

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from .models import Notification

from .serializers import NotificationSerializer


# =========================================================
# NOTIFICATION LIST + CREATE
# =========================================================

class NotificationListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        ).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


# =========================================================
# NOTIFICATION DETAIL
# =========================================================

class NotificationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        )


# =========================================================
# MARK AS READ
# =========================================================

class MarkNotificationReadView(
    generics.UpdateAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        notification = self.get_object()

        notification.is_read = True

        notification.save(
            update_fields=[
                "is_read"
            ]
        )

        serializer = self.get_serializer(
            notification
        )

        return Response(
            serializer.data
        )