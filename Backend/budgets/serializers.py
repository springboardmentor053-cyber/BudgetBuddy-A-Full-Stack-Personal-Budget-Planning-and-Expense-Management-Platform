from rest_framework import serializers
from .models import Budget


class BudgetAlertSerializer(serializers.Serializer):
    category = serializers.CharField()
    budget_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    utilization = serializers.FloatField()
    alert_level = serializers.CharField()
    alert_message = serializers.CharField()


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

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
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Budget already exists for this category and month."
            )

        return data
