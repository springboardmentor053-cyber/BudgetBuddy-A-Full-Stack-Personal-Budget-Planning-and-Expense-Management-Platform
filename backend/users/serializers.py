from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Expense, Income

User = get_user_model()


class ExpenseSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Expense
        fields = ('id', 'user', 'title', 'amount', 'category', 'description', 'expense_date', 'created_at', 'updated_at')


class IncomeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Income
        fields = ('id', 'user', 'source', 'amount', 'date', 'description')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False, min_length=8)
    confirmPassword = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm', 'confirmPassword', 'role')
        read_only_fields = ('id',)

    def validate(self, attrs):
        password_confirmation = attrs.pop('confirmPassword', None) or attrs.get('password_confirm')
        if password_confirmation and attrs.get('password') != password_confirmation:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Handles viewing and updating user profile details."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'date_joined')
        read_only_fields = ('id', 'username', 'role', 'date_joined')


class ChangePasswordSerializer(serializers.Serializer):
    """Handles updating the user's password securely."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(required=True, write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is not correct.')
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'New passwords do not match.'})
        validate_password(data['new_password'])
        return data


class UserTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # These claims are optional metadata. Never let an absent custom
        # attribute prevent SimpleJWT from issuing an otherwise valid token.
        try:
            token['role'] = getattr(user, 'role', None) or ''
            token['username'] = getattr(user, 'username', None) or ''
        except (AttributeError, TypeError, ValueError):
            pass
        return token

    def validate(self, attrs):
        # The public API retains SimpleJWT's conventional `username` key.
        # Its value may be a username or an email address.
        identifier = attrs.get(self.username_field)
        if not isinstance(identifier, str) or not identifier.strip():
            # Preserve SimpleJWT's standard invalid-credentials response.
            return super().validate(attrs)

        identifier = identifier.strip()
        user = User.objects.filter(username__iexact=identifier).first()
        if user is None:
            user = User.objects.filter(email__iexact=identifier).first()

        if user is None:
            raise AuthenticationFailed(
                self.error_messages['no_active_account'],
                'no_active_account',
            )

        # Map an email identifier to the canonical username before SimpleJWT
        # calls Django's authentication backend and checks the password.
        attrs[self.username_field] = user.get_username() or identifier
        data = super().validate(attrs)
        authenticated_user = getattr(self, 'user', None)
        data['user'] = {
            'id': getattr(authenticated_user, 'id', None),
            'username': getattr(authenticated_user, 'username', None) or '',
            'email': getattr(authenticated_user, 'email', None) or '',
            'role': getattr(authenticated_user, 'role', None) or '',
        }
        return data
