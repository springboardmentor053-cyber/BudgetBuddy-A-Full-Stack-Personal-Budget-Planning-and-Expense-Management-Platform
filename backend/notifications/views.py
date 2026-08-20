from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Notifications protected by JWT Authentication.
    - CREATE: POST /api/notifications/
    - LIST: GET /api/notifications/
    - RETRIEVE: GET /api/notifications/{id}/
    - UPDATE: PUT/PATCH /api/notifications/{id}/
    - DELETE: DELETE /api/notifications/{id}/
    - MARK AS READ: PATCH /api/notifications/{id}/read/
    """
    serializer_class = NotificationSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Strict user isolation: return notifications belonging only to the logged-in user
        return Notification.objects.filter(user=self.request.user).order_by('-created_at', '-id')

    def perform_create(self, serializer):
        # Auto-associate notification with current user
        serializer.save(user=self.request.user)

    # 🎯 TASK 5: Mark as Read API (PATCH /api/notifications/{id}/read/)
    @action(detail=True, methods=['patch', 'post'], url_path='read')
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({
            "message": "Notification marked as read.",
            "notification": NotificationSerializer(notification).data
        }, status=status.HTTP_200_OK)
