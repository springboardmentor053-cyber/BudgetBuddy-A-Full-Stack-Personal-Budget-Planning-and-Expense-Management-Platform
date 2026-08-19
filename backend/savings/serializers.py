from rest_framework import serializers
from django.utils import timezone
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields ='__all__'
        read_only_fields = ['id', 'user']

    def validate_target_amount(self, value):
        # Task 6: Target Amount should always be greater than zero
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate_saved_amount(self, value):
        # Task 6: Saved Amount should never be negative
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value

    def validate_target_date(self, value):
        # Task 6: Target date should not be in the past while creating a new goal
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError("Target date cannot be in the past.")
        return value