from rest_framework import serializers
from .models import Budget, SavingsGoal

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'budget_amount', 'month', 'year', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        user = self.context['request'].user
        category = data.get('category')
        month = data.get('month')
        year = data.get('year')

        queryset = Budget.objects.filter(user=user, category=category, month=month, year=year)

        # If updating, exclude the current instance from the duplicate check
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                f"A budget for '{category}' in {month}/{year} already exists."
            )
        return data


class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'title', 'target_amount', 'saved_amount', 'deadline', 'created_at']
        read_only_fields = ['id', 'created_at']