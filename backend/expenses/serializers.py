import re
from django.contrib.auth.models import User
from rest_framework import serializers

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer to validate user registration requests and create new User instances.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        """
        Validate that the email address is unique.
        """
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate_password(self, value):
        """
        Enforce strong password rules (e.g., minimum 8 characters, containing numbers).
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value

    def create(self, validated_data):
        """
        Create and return a new User using Django's create_user helper method,
        and automatically instantiate a corresponding UserProfile.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        from .models import UserProfile
        UserProfile.objects.create(user=user)
        return user




from .models import Expense, Income, Budget

class ExpenseSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Expense
        fields = ('id', 'user', 'title', 'amount', 'category', 'description', 'expense_date', 'created_at', 'updated_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class IncomeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Income
        fields = ('id', 'user', 'source', 'amount', 'description', 'income_date', 'created_at', 'updated_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class BudgetSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Budget
        fields = ('id', 'user', 'category', 'budget_amount', 'month', 'year', 'created_at', 'updated_at')

    def validate_budget_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        return value

    def validate_month(self, value):
        if not (1 <= value <= 12):
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        if not request or not request.user:
            return data

        user = request.user
        category = data.get('category')
        month = data.get('month')
        year = data.get('year')

        # Exclude current instance when updating
        instance_id = self.instance.id if self.instance else None
        queryset = Budget.objects.filter(user=user, category=category, month=month, year=year)
        if instance_id:
            queryset = queryset.exclude(id=instance_id)

        if queryset.exists():
            raise serializers.ValidationError("A budget for this category, month, and year already exists.")

        return data
