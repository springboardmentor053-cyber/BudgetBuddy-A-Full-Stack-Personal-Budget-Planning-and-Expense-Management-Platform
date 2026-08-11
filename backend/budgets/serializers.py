from decimal import Decimal

from rest_framework import serializers

from notifications.utils import (
    check_savings_goal_alert,
)

from .models import Budget, SavingsGoal


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["user"]

    def validate(self, data):
        request = self.context.get("request")

        if request is None:
            return data

        user = request.user

        category = data.get(
            "category",
            getattr(self.instance, "category", None),
        )

        month = data.get(
            "month",
            getattr(self.instance, "month", None),
        )

        existing_budget = Budget.objects.filter(
            user=user,
            category=category,
            month=month,
        )

        if self.instance:
            existing_budget = existing_budget.exclude(
                id=self.instance.id
            )

        if existing_budget.exists():
            raise serializers.ValidationError(
                {
                    "message": (
                        "A budget already exists for this "
                        "category and month."
                    )
                }
            )

        return data


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            "id",
            "user",
            "title",
            "target_amount",
            "saved_amount",
            "target_date",
            "description",
            "created_at",
            "updated_at",
            "progress_percentage",
            "remaining_amount",
        ]

        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
            "progress_percentage",
            "remaining_amount",
        ]

    def create(self, validated_data):
        savings_goal = super().create(validated_data)

        check_savings_goal_alert(savings_goal)

        return savings_goal

    def update(self, instance, validated_data):
        savings_goal = super().update(
            instance,
            validated_data,
        )

        check_savings_goal_alert(savings_goal)

        return savings_goal

    def get_progress_percentage(self, obj) -> float:
        if obj.target_amount == 0:
            return 0.0

        percentage = (
            obj.saved_amount / obj.target_amount
        ) * 100

        return round(float(percentage), 2)

    def get_remaining_amount(self, obj) -> Decimal:
        remaining = (
            obj.target_amount - obj.saved_amount
        )

        return max(
            remaining,
            Decimal("0.00"),
        )


class BudgetSummaryItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    category = serializers.CharField()
    month = serializers.CharField()
    year = serializers.IntegerField()

    budget_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    spent_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    percentage_used = serializers.FloatField()
    status = serializers.CharField()


class BudgetSummaryResponseSerializer(serializers.Serializer):
    total_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_spent = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_remaining = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    budgets = BudgetSummaryItemSerializer(
        many=True
    )


class BudgetErrorSerializer(serializers.Serializer):
    error = serializers.CharField()