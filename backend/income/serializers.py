from rest_framework import serializers
from .models import Income


class IncomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Income
        fields = [
            "id",
            "title",
            "amount",
            "source",
            "description",
            "income_date",
            "created_at",
            "updated_at",
            "user",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "user",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Income title is required."
            )

        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Income amount must be greater than 0."
            )

        return value

    def validate_income_date(self, value):
        if not value:
            raise serializers.ValidationError(
                "Income date is required."
            )

        return value