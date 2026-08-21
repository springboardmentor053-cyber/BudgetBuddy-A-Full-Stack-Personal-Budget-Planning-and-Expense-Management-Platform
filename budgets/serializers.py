from rest_framework import serializers
from .models import Budget
from expenses.models import Expense
from expenses.serializers import CATEGORY_MAP

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["id", "user"]

    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Category cannot be empty.")
        upper_val = str(value).strip().upper()
        if upper_val in CATEGORY_MAP:
            return CATEGORY_MAP[upper_val]
        valid_keys = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if upper_val in valid_keys:
            return upper_val
        raise serializers.ValidationError(
            f"'{value}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."
        )

    def validate_limit_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Limit amount must be greater than zero.")
        return value

    def validate_month(self, value):
        if not value:
            raise serializers.ValidationError("Month cannot be empty.")
        month_cap = str(value).strip().capitalize()
        VALID_MONTHS = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        if month_cap not in VALID_MONTHS:
            raise serializers.ValidationError(
                f"'{value}' is not a valid month. Month must be one of: {', '.join(VALID_MONTHS)}."
            )
        
        import datetime
        current_month_index = datetime.date.today().month  # 1-12
        selected_month_index = VALID_MONTHS.index(month_cap) + 1  # 1-12
        if selected_month_index < current_month_index:
            raise serializers.ValidationError("Budgets cannot be set for previous months.")
            
        return month_cap

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user:
            category = attrs.get('category')
            month = attrs.get('month')
            
            if category:
                category = category.strip().upper()
                if category in CATEGORY_MAP:
                    category = CATEGORY_MAP[category]
                    
            if month:
                month = month.strip().capitalize()

            qs = Budget.objects.filter(user=request.user, category__iexact=category, month__iexact=month)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    f"A budget for category '{category}' in '{month}' already exists for this user."
                )
        return attrs

