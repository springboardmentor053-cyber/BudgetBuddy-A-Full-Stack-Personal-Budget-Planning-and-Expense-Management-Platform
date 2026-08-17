from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):

    user = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    class Meta:

        model = Expense

        fields = [
            "id",
            "user",
            "category",
            "amount",
            "date",
            "description",
        ]

        read_only_fields = [
            "id",
            "user",
        ]

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Expense amount must be greater than 0."
            )

        return value

    def validate_category(self, value):

        if not value:
            raise serializers.ValidationError(
                "Expense category is required."
            )

        return value