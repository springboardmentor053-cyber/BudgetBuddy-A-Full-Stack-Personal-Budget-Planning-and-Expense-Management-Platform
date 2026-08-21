from rest_framework import serializers
from .models import Income

class IncomeSerializer(serializers.ModelSerializer):
    source = serializers.CharField()

    class Meta:
        model = Income
        fields = ['id', 'title', 'amount', 'source', 'description', 'income_date', 'created_at', 'updated_at', 'user']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

    def validate_source(self, value):
        if not value:
            raise serializers.ValidationError("Source cannot be empty.")
        upper_val = str(value).strip().upper()
        valid_keys = [choice[0] for choice in Income.SOURCE_CHOICES]
        if upper_val in valid_keys:
            return upper_val
        raise serializers.ValidationError(
            f"'{value}' is not a valid source. Valid choices are: {', '.join(valid_keys)}."
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

