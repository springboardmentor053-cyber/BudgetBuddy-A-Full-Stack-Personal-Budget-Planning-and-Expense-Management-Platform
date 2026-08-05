from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers
from .models import SavingsGoal, Notification


class SavingsGoalSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    goal_status = serializers.CharField(source='status', read_only=True)

    class Meta:
        model = SavingsGoal
        fields = (
            'id',
            'user',
            'goal_name',
            'target_amount',
            'saved_amount',
            'target_date',
            'status',
            'remaining_amount',
            'progress_percentage',
            'goal_status',
            'created_at',
            'updated_at',
        )

    def get_remaining_amount(self, obj):
        remaining = Decimal(str(obj.target_amount)) - Decimal(str(obj.saved_amount))
        return float(max(Decimal('0.00'), remaining.quantize(Decimal('0.01'))))

    def get_progress_percentage(self, obj):
        if not obj.target_amount or Decimal(str(obj.target_amount)) == Decimal('0'):
            return 0.0
        percentage = (Decimal(str(obj.saved_amount)) / Decimal(str(obj.target_amount))) * Decimal('100')
        return float(min(Decimal('100.00'), percentage.quantize(Decimal('0.01'))))

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value

    def validate_target_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Target date cannot be in the past.")
        return value

    def validate(self, data):
        # Retrieve target_amount and saved_amount from data or instance
        target_amount = data.get('target_amount', getattr(self.instance, 'target_amount', None))
        saved_amount = data.get('saved_amount', getattr(self.instance, 'saved_amount', 0))

        if target_amount is not None and saved_amount is not None:
            if Decimal(str(saved_amount)) > Decimal(str(target_amount)):
                raise serializers.ValidationError({"saved_amount": "Saved amount cannot exceed target amount."})

        return data


class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Notification
        fields = (
            'id',
            'user',
            'title',
            'message',
            'notification_type',
            'priority',
            'is_read',
            'created_at',
        )

