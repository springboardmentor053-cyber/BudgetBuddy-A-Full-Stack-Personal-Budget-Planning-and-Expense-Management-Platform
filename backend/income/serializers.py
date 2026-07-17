from rest_framework import serializers

from .models import Income


class IncomeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Income
        fields = ('id', 'user', 'title', 'amount', 'category', 'description', 'income_date', 'created_at', 'updated_at')
