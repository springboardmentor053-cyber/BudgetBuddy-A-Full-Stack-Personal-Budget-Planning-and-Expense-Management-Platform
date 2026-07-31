from rest_framework import serializers
from django.utils import timezone
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'goal_name', 'target_amount', 'saved_amount', 'target_date', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value

    def validate_target_date(self, value):
        if not self.instance and value < timezone.now().date():
            raise serializers.ValidationError("Target date cannot be in the past.")
        return value
