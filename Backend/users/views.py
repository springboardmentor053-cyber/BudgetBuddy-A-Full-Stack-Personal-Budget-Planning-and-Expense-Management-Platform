from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from .models import Profile
from .serializers import (
    ProfileSerializer,
    UserRegistrationSerializer,
)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
