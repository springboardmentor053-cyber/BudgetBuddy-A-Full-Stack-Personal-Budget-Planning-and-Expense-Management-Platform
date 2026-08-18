from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Profile
from .serializers import ProfileSerializer
from .serializers import RegisterSerializer
from rest_framework import generics
from .serializers import ChangePasswordSerializer
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.views import APIView
from rest_framework.response import Response

# from notifications.models import Notification
# from .serializers import NotificationSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "User registered successfully."
            },
            status=status.HTTP_201_CREATED,
        )
class ProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():

            user = request.user

            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"error": "Old password is incorrect."},
                    status=400
                )

            user.set_password(serializer.validated_data["new_password"])
            user.save()

            return Response({
                "message": "Password changed successfully."
            })

        return Response(serializer.errors, status=400)
