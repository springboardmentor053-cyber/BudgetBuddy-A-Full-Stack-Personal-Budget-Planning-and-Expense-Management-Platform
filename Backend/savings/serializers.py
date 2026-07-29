from rest_framework import serializers
from datetime import date
from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavingsGoal
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Target Amount should be greater than zero."
            )
        return value

    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Saved Amount cannot be negative."
            )
        return value

    def validate_target_date(self, value):
        if value < date.today():
            raise serializers.ValidationError(
                "Target Date cannot be in the past."
            )
        return value
