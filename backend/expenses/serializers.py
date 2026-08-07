from rest_framework import serializers
from .models import Expense
from django.utils import timezone


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'expense_date', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_expense_date(self, value):
        # Allow past or present dates; do not accept future dates
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Expense date cannot be in the future.")
        return value