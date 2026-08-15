from rest_framework import serializers
from .models import Income


class IncomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Income
        fields = "__all__"
        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
        ]