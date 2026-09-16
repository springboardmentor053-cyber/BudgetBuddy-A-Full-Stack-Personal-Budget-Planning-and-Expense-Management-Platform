import calendar

from rest_framework import serializers

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["user"]

    def validate_budget_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Budget amount must be greater than zero."
            )
        return value

    def validate_month(self, value):
        if not value:
            raise serializers.ValidationError("Month is required.")
        # Convert numeric month to name e.g. 9 -> September
        try:
            month_int = int(value)
            if 1 <= month_int <= 12:
                return calendar.month_name[month_int]
        except (ValueError, TypeError):
            pass
        # Already a month name
        if str(value).strip().capitalize() in list(calendar.month_name):
            return str(value).strip().capitalize()
        raise serializers.ValidationError("Invalid month value.")

    def validate_year(self, value):
        if not value:
            raise serializers.ValidationError("Year is required.")
        if value < 2000:
            raise serializers.ValidationError("Please enter a valid year.")
        return value

    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Budget category is required.")
        return value