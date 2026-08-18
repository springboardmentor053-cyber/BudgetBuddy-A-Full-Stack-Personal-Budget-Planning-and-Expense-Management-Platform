from rest_framework import serializers

from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavingsGoal

        fields = [
            "id",
            "goal_name",
            "target_amount",
            "saved_amount",
            "target_date",
            "remaining_amount",
            "progress_percentage",
        ]

        read_only_fields = [
            "id",
            "remaining_amount",
            "progress_percentage",
        ]

    # =====================================================
    # GOAL NAME VALIDATION
    # =====================================================

    def validate_goal_name(self, value):

        if not value.strip():

            raise serializers.ValidationError(
                "Goal name cannot be empty."
            )

        return value.strip()

    # =====================================================
    # TARGET AMOUNT VALIDATION
    # =====================================================

    def validate_target_amount(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Target amount must be greater than zero."
            )

        return value

    # =====================================================
    # SAVED AMOUNT VALIDATION
    # =====================================================

    def validate_saved_amount(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Saved amount cannot be negative."
            )

        return value

    # =====================================================
    # TARGET DATE VALIDATION
    # =====================================================

    def validate_target_date(self, value):

        if value is None:

            raise serializers.ValidationError(
                "Target date is required."
            )

        return value

    # =====================================================
    # CROSS-FIELD VALIDATION
    # =====================================================

    def validate(self, attrs):

        target_amount = attrs.get(
            "target_amount"
        )

        saved_amount = attrs.get(
            "saved_amount"
        )

        # During UPDATE, use existing values
        # when a field wasn't provided.

        if self.instance:

            if target_amount is None:
                target_amount = self.instance.target_amount

            if saved_amount is None:
                saved_amount = self.instance.saved_amount

        # During CREATE
        else:

            if target_amount is None:
                raise serializers.ValidationError({
                    "target_amount":
                        "Target amount is required."
                })

            if saved_amount is None:
                saved_amount = 0

        # Prevent saved amount from exceeding target

        if saved_amount > target_amount:

            raise serializers.ValidationError({
                "saved_amount":
                    "Saved amount cannot be greater than the target amount."
            })

        return attrs