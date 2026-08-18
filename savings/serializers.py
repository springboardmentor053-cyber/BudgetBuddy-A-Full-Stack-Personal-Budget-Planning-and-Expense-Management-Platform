from rest_framework import serializers
from .models import SavingsGoal
from datetime import date

class SavingsGoalSerializer(serializers.ModelSerializer):

    progress_percentage = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = "__all__"
        read_only_fields = (
            "user",
            "created_at",
            "updated_at",
        )

    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            return round(
                (obj.saved_amount / obj.target_amount) * 100,
                2
            )
        return 0

    def get_remaining_amount(self, obj):
        return obj.target_amount - obj.saved_amount

    def get_days_left(self, obj):
        return (obj.target_date - date.today()).days

    def validate(self, data):
        if data["saved_amount"] > data["target_amount"]:
            raise serializers.ValidationError(
                "Saved amount cannot exceed target amount."
            )
        return data