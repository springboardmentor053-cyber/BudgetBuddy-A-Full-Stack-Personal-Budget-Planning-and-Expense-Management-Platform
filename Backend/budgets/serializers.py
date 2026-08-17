from rest_framework import serializers
from django.db.models import Sum

from .models import Budget
from expenses.models import Expense


class BudgetSerializer(serializers.ModelSerializer):

    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = [
            "user",
            "spent",
            "remaining",
            "utilization_percentage",
        ]

    def validate(self, data):

        user = self.context["request"].user

        category = data.get("category")
        month = data.get("month")
        year = data.get("year")

        queryset = Budget.objects.filter(
            user=user,
            category=category,
            month=month,
            year=year
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Budget already exists for this category, month and year."
            )

        return data

    # ==========================================
    # SPENT
    # ==========================================

    def get_spent(self, obj):

        total = Expense.objects.filter(
            user=obj.user,
            category=obj.category
        ).aggregate(
            total=Sum("amount")
        )["total"]

        return total or 0

    # ==========================================
    # REMAINING
    # ==========================================

    def get_remaining(self, obj):

        spent = self.get_spent(obj)

        return obj.budget_amount - spent

    # ==========================================
    # UTILIZATION
    # ==========================================

    def get_utilization_percentage(self, obj):

        if not obj.budget_amount:
            return 0

        spent = self.get_spent(obj)

        percentage = (
            spent / obj.budget_amount
        ) * 100

        return round(percentage, 2)