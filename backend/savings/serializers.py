from datetime import date
from rest_framework import serializers
from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    remaining_amount = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'user',
            'goal_name',
            'target_amount',
            'saved_amount',
            'remaining_amount',
            'progress_percentage',
            'target_date',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    # 🛑 1. Target Amount Validation: Must be greater than zero (> 0)
    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    # 🛑 2. Saved Amount Validation: Cannot be negative (< 0)
    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value

    # 🛑 3. Target Date Validation: Cannot be in the past when creating a new goal
    def validate_target_date(self, value):
        # self.instance is None when creating a new goal (POST)
        if self.instance is None and value < date.today():
            raise serializers.ValidationError("Target date cannot be in the past when creating a goal.")
        return value