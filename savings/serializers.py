from rest_framework import serializers
from budgets.models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = "__all__"
        read_only_fields = ["id", "user"]
