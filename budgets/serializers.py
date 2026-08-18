from rest_framework import serializers

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget

        fields = "__all__"

        read_only_fields = [
            "user",
        ]

    # =====================================================
    # BUDGET AMOUNT VALIDATION
    # =====================================================

    def validate_budget_amount(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Budget amount must be greater than zero."
            )

        return value

    # =====================================================
    # MONTH VALIDATION
    # =====================================================

    def validate_month(self, value):

        if not value:

            raise serializers.ValidationError(
                "Month is required."
            )

        return value

    # =====================================================
    # YEAR VALIDATION
    # =====================================================

    def validate_year(self, value):

        if not value:

            raise serializers.ValidationError(
                "Year is required."
            )

        if value < 2000:

            raise serializers.ValidationError(
                "Please enter a valid year."
            )

        return value

    # =====================================================
    # CATEGORY VALIDATION
    # =====================================================

    def validate_category(self, value):

        if not value:

            raise serializers.ValidationError(
                "Budget category is required."
            )

        return value