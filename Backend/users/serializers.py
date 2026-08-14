from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        Profile.objects.create(
            user=user,
            phone="",
            location="",
            profession="",
            monthly_income=0,
            currency="INR",
            financial_goal=""
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):
    # Expose user fields read-only so the frontend receives them together
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "location",
            "profession",
            "monthly_income",
            "currency",
            "financial_goal",
            "created_at",
        ]
