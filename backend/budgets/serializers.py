from rest_framework import serializers
from .models import Budget, SavingsGoal

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'monthly_limit', 'month', 'created_at']
        read_only_fields = ['id', 'created_at']


class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'title', 'target_amount', 'saved_amount', 'deadline', 'created_at']
        read_only_fields = ['id', 'created_at']