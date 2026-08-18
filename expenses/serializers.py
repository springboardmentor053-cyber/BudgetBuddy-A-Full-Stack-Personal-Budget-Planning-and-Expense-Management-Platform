from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense

        fields = [
            "id",
            "title",
            "amount",
            "category",
            "date",
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
    # CATEGORY VALIDATION
    # =====================================================

    def validate_category(self, value):

        if not value:

            raise serializers.ValidationError(
                "Expense category is required."
            )

        return value

    # =====================================================
    # DATE VALIDATION
    # =====================================================

    def validate_date(self, value):

        if value is None:

            raise serializers.ValidationError(
                "Expense date is required."
            )

        return value