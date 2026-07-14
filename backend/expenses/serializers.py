from rest_framework import serializers
from .models import Expense, Income

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'description', 'expense_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'source', 'amount', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']