from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


# ==========================================================
# Notification CRUD APIs
# ==========================================================

class NotificationListCreateView(generics.ListCreateAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


# ==========================================================
# Notification Detail
# ==========================================================

class NotificationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )


# ==========================================================
# Mark Notification as Read
# ==========================================================

class MarkNotificationReadAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        notification = get_object_or_404(
            Notification,
            pk=pk,
            user=request.user
        )

        notification.is_read = True
        notification.save()

        return Response({
            "message": "Notification marked as read successfully.",
            "notification_id": notification.id,
            "is_read": notification.is_read
        })