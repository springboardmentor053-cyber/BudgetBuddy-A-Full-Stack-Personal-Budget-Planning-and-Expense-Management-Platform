from rest_framework import serializers
from .models import Expense

CATEGORY_MAP = {
    'FOOD': 'FOOD',
    'TRAVEL': 'TRAVEL',
    'TRANSPORT': 'TRAVEL',
    'SHOPPING': 'SHOPPING',
    'EDUCATION': 'EDUCATION',
    'ENTERTAINMENT': 'ENTERTAINMENT',
    'HEALTHCARE': 'HEALTHCARE',
    'HEALTH': 'HEALTHCARE',
    'BILLS': 'BILLS',
    'MISCELLANEOUS': 'MISCELLANEOUS',
    'OTHER': 'MISCELLANEOUS',
}

class ExpenseSerializer(serializers.ModelSerializer):
    category = serializers.CharField()

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["id", "user"]

    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Category cannot be empty.")
        upper_val = str(value).strip().upper()
        if upper_val in CATEGORY_MAP:
            return CATEGORY_MAP[upper_val]
        valid_keys = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if upper_val in valid_keys:
            return upper_val
        raise serializers.ValidationError(
            f"'{value}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."
        )

        