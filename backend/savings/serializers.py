# savings/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    # Dynamic computed fields for Goal Progress API (Task 5)
    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'user',
            'goal_name',
            'target_amount',
            'saved_amount',
            'target_date',
            'status',
                'remaining_amount',
                'progress_percentage',
                'days_remaining',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    # Task 5 Calculations
    def get_remaining_amount(self, obj):
        remaining = obj.target_amount - obj.saved_amount
        return max(0.00, float(remaining))

    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            pct = (obj.saved_amount / obj.target_amount) * 100
            return round(min(100.0, float(pct)), 2)
        return 0.0

    # Task 6 Validation Rules
    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target Amount should always be greater than zero.")
        return value

    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved Amount should never be negative.")
        return value

    def validate_target_date(self, value):
        # Only enforce future date check during goal creation
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError("Target Date should not be in the past while creating a new goal.")
        return value

    def get_days_remaining(self, obj):
        if not obj.target_date:
            return None
        today = timezone.now().date()
        delta = (obj.target_date - today).days
        return max(0, delta)