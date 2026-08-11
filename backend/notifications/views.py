from rest_framework import viewsets
from rest_framework.permissions import (
    IsAuthenticated,
)

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    viewsets.ModelViewSet
):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Notification.objects.none()

        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )