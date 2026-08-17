from rest_framework import serializers
from django.utils import timezone

from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):

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
            'target_date',
            'status',
            'remaining_amount',
            'progress_percentage',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'status',
            'remaining_amount',
            'progress_percentage',
            'created_at',
            'updated_at',
        ]

    # ==========================================
    # Validation: Target Amount
    # ==========================================

    def validate_target_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Target amount must be greater than zero."
            )

        return value

    # ==========================================
    # Validation: Saved Amount
    # ==========================================

    def validate_saved_amount(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Saved amount cannot be negative."
            )

        return value

    # ==========================================
    # Validation: Target Date
    # ==========================================

    def validate_target_date(self, value):

        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError(
                "Target date cannot be in the past."
            )

        return value