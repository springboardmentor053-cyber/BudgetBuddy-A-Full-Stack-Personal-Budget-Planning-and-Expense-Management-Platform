from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from .models import Profile
from .serializers import (
    ProfileSerializer,
    UserRegistrationSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserSettingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return default or user-configured preferences
        user = request.user
        return Response({
            "currency": getattr(user, 'currency', 'USD'),
            "theme": getattr(user, 'theme', 'dark'),
            "notifications_enabled": True,
        })
