from rest_framework import serializers
from django.db.models import Sum
from .models import Budget
from expenses.models import Expense

class BudgetSerializer(serializers.ModelSerializer):
    current_amount = serializers.SerializerMethodField(method_name='get_spent')

    class Meta:
        model = Budget
        fields = ['id', 'user', 'category', 'budget_amount', 'month', 'year', 'current_amount']
        read_only_fields = ['user']

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user:
            category = attrs.get('category')
            month = attrs.get('month')
            year = attrs.get('year')
            user = request.user

            # Check if we are creating (or modifying) and a duplicate exists
            qs = Budget.objects.filter(user=user, category=category, month=month, year=year)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            
            if qs.exists():
                raise serializers.ValidationError(
                    "You have already defined a budget target for this category in the selected month & year!"
                )
        return attrs

    def get_spent(self, obj):
        # Calculates total expenses matching this budget's category, month, and year
        total = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            created_at__month=obj.month,
            created_at__year=obj.year
        ).aggregate(Sum('amount'))['amount__sum']
        
        return total if total is not None else 0