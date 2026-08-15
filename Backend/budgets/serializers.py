from rest_framework import serializers

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget
        fields = "__all__"

        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):

        user = self.context["request"].user

        category = data.get("category")
        month = data.get("month")
        year = data.get("year")

        if self.instance is None:

            if Budget.objects.filter(
                user=user,
                category=category,
                month=month,
                year=year
            ).exists():

                raise serializers.ValidationError(
                    "Budget already exists for this category and month."
                )

        else:

            if Budget.objects.filter(
                user=user,
                category=category,
                month=month,
                year=year
            ).exclude(
                pk=self.instance.pk
            ).exists():

                raise serializers.ValidationError(
                    "Budget already exists for this category and month."
                )

        return data