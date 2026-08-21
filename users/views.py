from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from .models import Profile


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)
        return Response({
            'username': user.username,
            'email': user.email,
            'email_notifications_enabled': profile.email_notifications_enabled,
        }, status=200)

    def put(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)

        email_notifications_enabled = request.data.get('email_notifications_enabled')
        if email_notifications_enabled is not None:
            if isinstance(email_notifications_enabled, str):
                profile.email_notifications_enabled = email_notifications_enabled.lower() in ('true', '1')
            else:
                profile.email_notifications_enabled = bool(email_notifications_enabled)
            profile.save()

        email = request.data.get('email')
        if email is not None:
            user.email = email
            user.save()

        return Response({
            'username': user.username,
            'email': user.email,
            'email_notifications_enabled': profile.email_notifications_enabled,
        }, status=200)