from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from rest_framework import status

from .serializers import RegisterSerializer, ProfileSerializer
from .models import Profile


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(profile)

        return Response(serializer.data)

    def put(self, request):

        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
            profile,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )
class ChangePasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Check all fields
        if not current_password or not new_password or not confirm_password:
            return Response(
                {
                    "error": "All password fields are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check current password
        if not request.user.check_password(current_password):
            return Response(
                {
                    "error": "Current password is incorrect."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check new passwords
        if new_password != confirm_password:
            return Response(
                {
                    "error": "New passwords do not match."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Minimum password length
        if len(new_password) < 8:
            return Response(
                {
                    "error": "New password must contain at least 8 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Change password
        request.user.set_password(new_password)
        request.user.save()

        # Keep the current user logged in
        update_session_auth_hash(
            request,
            request.user
        )

        return Response(
            {
                "message": "Password changed successfully."
            },
            status=status.HTTP_200_OK
        )