from datetime import date

from rest_framework import serializers

from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavingsGoal

        fields = "__all__"

        read_only_fields = [
            "user",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):

        target_amount = data.get(
            "target_amount"
        )

        saved_amount = data.get(
            "saved_amount",
            0
        )

        # -----------------------------------------
        # TARGET AMOUNT VALIDATION
        # -----------------------------------------

        if (
            target_amount is not None
            and target_amount <= 0
        ):
            raise serializers.ValidationError({
                "target_amount":
                "Target amount must be greater than 0."
            })

        # -----------------------------------------
        # SAVED AMOUNT VALIDATION
        # -----------------------------------------

        if (
            saved_amount is not None
            and saved_amount < 0
        ):
            raise serializers.ValidationError({
                "saved_amount":
                "Saved amount cannot be negative."
            })

        # -----------------------------------------
        # SAVED AMOUNT CANNOT EXCEED TARGET
        # -----------------------------------------

        if (
            target_amount is not None
            and saved_amount is not None
            and saved_amount > target_amount
        ):
            raise serializers.ValidationError({
                "saved_amount":
                "Saved amount cannot be greater than target amount."
            })

        # -----------------------------------------
        # DEADLINE VALIDATION
        # Only required when creating a new goal
        # -----------------------------------------

        deadline = data.get("deadline")

        if self.instance is None and deadline is not None:

            if deadline < date.today():

                raise serializers.ValidationError({
                    "deadline":
                    "Target date cannot be in the past."
                })

        return data

    def create(self, validated_data):

        target_amount = validated_data.get(
            "target_amount"
        )

        saved_amount = validated_data.get(
            "saved_amount",
            0
        )

        if saved_amount >= target_amount:
            validated_data["status"] = "COMPLETED"
        else:
            validated_data["status"] = "IN_PROGRESS"

        return super().create(
            validated_data
        )

    def update(self, instance, validated_data):

        target_amount = validated_data.get(
            "target_amount",
            instance.target_amount
        )

        saved_amount = validated_data.get(
            "saved_amount",
            instance.saved_amount
        )

        if saved_amount >= target_amount:
            validated_data["status"] = "COMPLETED"
        else:
            validated_data["status"] = "IN_PROGRESS"

        return super().update(
            instance,
            validated_data
        )