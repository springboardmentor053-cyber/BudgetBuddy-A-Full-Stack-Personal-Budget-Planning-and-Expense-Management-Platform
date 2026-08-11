from rest_framework import serializers


class FinancialSummarySerializer(serializers.Serializer):
    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    current_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_savings = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    remaining_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )
class CategoryExpenseSerializer(serializers.Serializer):
    category = serializers.CharField()
    total_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )
class MonthlyExpenseSerializer(serializers.Serializer):
    month = serializers.CharField()
    total_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )