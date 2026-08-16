from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense
        fields = [
            "id",
            "user",
            "title",
            "amount",
            "category",
            "date",
            "description",
        ]

        read_only_fields = [
            "id",
            "user",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Expense title is required."
            )

        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Expense amount must be greater than 0."
            )

        return value

    def validate_date(self, value):
        if not value:
            raise serializers.ValidationError(
                "Expense date is required."
            )

        return value

    def validate_description(self, value):
        return value.strip()