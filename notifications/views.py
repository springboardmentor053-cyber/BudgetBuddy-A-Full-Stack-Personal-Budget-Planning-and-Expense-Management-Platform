from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from notifications.models import Notification
from .serializers import NotificationSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def initial(self, request, *args, **kwargs):
        print("=" * 50)
        print("NotificationListView reached")
        print("Authorization:", request.headers.get("Authorization"))
        super().initial(request, *args, **kwargs)

    def get_queryset(self):
        seven_days_ago = (
                timezone.now() - timedelta(days=7)
            )
        queryset = Notification.objects.filter(
            user=self.request.user,
            created_at__gte=seven_days_ago
        ).order_by(
            "is_read",
            "-created_at"
        )

        print("USER:", self.request.user)
        print("NOTIFICATION COUNT:", queryset.count())
        print(
            "NOTIFICATIONS:",
            list(
                queryset.values(
                    "id",
                    "title",
                    "message",
                    "is_read",
                    "created_at"
                )
            )
        )
        return Notification.objects.filter(
                user=self.request.user,
                created_at__gte=seven_days_ago
            ).order_by(
                "is_read",
                "-created_at"
            )   
        

# class NotificationReadView(generics.UpdateAPIView):

#     serializer_class = NotificationSerializer
#     permission_classes = [IsAuthenticated]
#     def get_queryset(self):
#         return Notification.objects.filter(
#             user=self.request.user
#         )
#     def perform_update(self, serializer):
#         serializer.save(is_read=True)
#     def patch(self, request, *args, **kwargs):

#         notification = self.get_object()
#         notification.is_read = True
#         notification.save()

#         return Response({
#             "message": "Notification marked as read"
#         })
class NotificationReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            notification = Notification.objects.get(
                id=pk,
                user=request.user
            )
            notification.is_read = True
            notification.save()

            return Response({
                "message": "Notification marked as read"
            })

        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=404
            )

# class NotificationListView(generics.ListAPIView):
#     serializer_class = NotificationSerializer
#     permission_classes = [IsAuthenticated]

#     def initial(self, request, *args, **kwargs):
#         print("=" * 50)
#         print("NotificationListView reached")
#         print("Authorization:", request.headers.get("Authorization"))
#         super().initial(request, *args, **kwargs)

#     def get_queryset(self):
#         print("Authenticated user:", self.request.user)
#         return Notification.objects.filter(
#             user=self.request.user
#         ).order_by("is_read", "-created_at")

# class NotificationReadView(generics.UpdateAPIView):

#     serializer_class = NotificationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return Notification.objects.filter(
#             user=self.request.user
#         )

#     def perform_update(self, serializer):
#         serializer.save(is_read=True)

class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({
            "message": "All notifications marked as read"
        })
class UnreadNotificationCountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response({
            "unread_count": count
        })
# class NotificationCountAPIView(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request):

#         count = Notification.objects.filter(
#             user=request.user,
#             is_read=False
#         ).count()

#         return Response({
#             "unread_count": count
#         })