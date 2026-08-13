from rest_framework import serializers

from .models import Budget


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
        if category:
            data['category'] = category.strip()

        # Exclude the current instance when validating an update.
        queryset = Budget.objects.filter(
            user=user,
            category__iexact=data.get('category'),
            month=month,
            year=year,
        )
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                'A budget for this category and month already exists.'
            )

        return data
