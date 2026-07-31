from rest_framework import serializers
from .models import Budget, SavingsGoal




class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"


class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = "__all__"

def validate(self, data):

    user = self.context["request"].user

    if Budget.objects.filter(
            user=user,
            category=data["category"],
            month=data["month"],
            year=data["year"]
    ).exists():

        raise serializers.ValidationError(
            "Budget already exists for this category and month."
        )

    return data