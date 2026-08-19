from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate(self, data):
        # Task 5: Prevent duplicate budgets validation on API requests
        request = self.context.get('request')
        user = request.user if request else None
        category = data.get('category')
        month = data.get('month')
        year = data.get('year')

        if self.instance is None and user:
            if Budget.objects.filter(user=user, category=category, month=month, year=year).exists():
                raise serializers.ValidationError("A budget for this category, month, and year already exists.")
        return data