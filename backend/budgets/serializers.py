from rest_framework import serializers
from django.db.models import Sum

from .models import Budget
from users.models import Expense


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage_used = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'budget_amount', 'month', 'year', 'created_at', 'updated_at',
            'spent', 'remaining', 'percentage_used',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def _spent_for_budget(self, budget):
        """Calculate spending from the budget owner's transactions.

        Serializers are also used outside a request (for example from tests or
        another API view), so this must not depend on ``request.user``.
        """
        total = Expense.objects.filter(
            user=budget.user,
            category__iexact=budget.category.strip(),
            expense_date__year=int(budget.year),
            expense_date__month=int(budget.month),
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)

    def get_spent(self, budget):
        return self._spent_for_budget(budget)

    def get_remaining(self, budget):
        return max(0.0, float(budget.budget_amount) - self._spent_for_budget(budget))

    def get_percentage_used(self, budget):
        amount = float(budget.budget_amount)
        return (self._spent_for_budget(budget) / amount) * 100 if amount > 0 else 0.0

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
