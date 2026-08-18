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
        ]

        read_only_fields = [
            "id",
        ]

    # =====================================================
    # AMOUNT VALIDATION
    # =====================================================

    def validate_amount(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value

    # =====================================================
    # TITLE VALIDATION
    # =====================================================

    def validate_title(self, value):

        if not value.strip():

            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return value

    # =====================================================
    # SOURCE VALIDATION
    # =====================================================

    def validate_source(self, value):

        if not value:

            raise serializers.ValidationError(
                "Income source is required."
            )

        return value

    # =====================================================
    # DATE VALIDATION
    # =====================================================

    def validate_income_date(self, value):

        if value is None:

            raise serializers.ValidationError(
                "Income date is required."
            )

        return value