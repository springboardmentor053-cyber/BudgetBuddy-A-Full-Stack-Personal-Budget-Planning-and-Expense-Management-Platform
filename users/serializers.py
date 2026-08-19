from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        Profile.objects.create(user=user)

        return user


class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username"
    )

    email = serializers.EmailField(
        source="user.email"
    )

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True
    )

    phone = serializers.CharField(
        required=False,
        allow_blank=True
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Profile
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "address",
            "profile_picture",
        ]
        read_only_fields = []

    def update(self, instance, validated_data):

        user_data = validated_data.pop("user", {})

        user = instance.user

        user.username = user_data.get(
            "username",
            user.username
        )

        user.email = user_data.get(
            "email",
            user.email
        )

        user.first_name = user_data.get(
            "first_name",
            user.first_name
        )

        user.last_name = user_data.get(
            "last_name",
            user.last_name
        )

        user.save()

        instance.phone = validated_data.get(
            "phone",
            instance.phone
        )

        instance.address = validated_data.get(
            "address",
            instance.address
        )

        instance.profile_picture = validated_data.get(
            "profile_picture",
            instance.profile_picture
        )

        instance.save()

        return instance