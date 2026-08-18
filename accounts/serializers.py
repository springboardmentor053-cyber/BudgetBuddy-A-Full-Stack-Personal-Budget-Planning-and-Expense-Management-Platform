from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from notifications.models import Notification
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
        ]

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "password":
                    "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")

        user = User.objects.create_user(

            username=validated_data["username"],

            email=validated_data["email"],

            password=validated_data["password"],

            first_name=validated_data.get(
                "first_name",
                ""
            ),

            last_name=validated_data.get(
                "last_name",
                ""
            ),
        )

        Profile.objects.create(user=user)

        return user
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    first_name = serializers.CharField(
        source="user.first_name",
        
    )

    last_name = serializers.CharField(
        source="user.last_name",
        
    )

    class Meta:
        model = Profile
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "currency",
            "monthly_income",
            "profile_picture",
            "created_at",
            "bio",
            "accent_color",
        ]
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        
        if user_data:
        
                user = instance.user
        
                user.first_name = user_data.get(
                    "first_name",
                    user.first_name
                )
        
                user.last_name = user_data.get(
                    "last_name",
                    user.last_name
                )
        
                user.save()
        
        instance.phone_number = validated_data.get(
                "phone_number",
                instance.phone_number
            )
        
        instance.currency = validated_data.get(
                "currency",
                instance.currency
            )
        
        instance.monthly_income = validated_data.get(
                "monthly_income",
                instance.monthly_income
            )
        
        instance.bio = validated_data.get(
                "bio",
                instance.bio
            )
        if "profile_picture" in validated_data:
            instance.profile_picture = validated_data["profile_picture"]

        
        instance.save()
        
        return instance

    

    
class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = (
            "user",
            "created_at",
        )
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value