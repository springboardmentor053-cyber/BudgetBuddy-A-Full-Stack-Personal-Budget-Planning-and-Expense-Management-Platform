import datetime
from decimal import Decimal
from rest_framework import serializers
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = [
            'id', 'goal_name', 'target_amount', 'saved_amount',
            'target_date', 'status', 'created_at', 'updated_at', 'user',
            'is_automated', 'auto_save_amount', 'frequency',
            'custom_interval_days', 'auto_save_start_date', 'last_auto_save_date'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'last_auto_save_date']

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value

    def validate_auto_save_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Auto-save amount cannot be negative.")
        return value

    def validate_target_date(self, value):
        # Only validate that the date is not in the past when creating a new goal
        if self.instance is None:
            if value < datetime.date.today():
                raise serializers.ValidationError("Target date cannot be in the past.")
        return value

    def validate(self, data):
        target_amount = data.get('target_amount')
        saved_amount = data.get('saved_amount')

        if self.instance:
            if target_amount is None:
                target_amount = self.instance.target_amount
            if saved_amount is None:
                saved_amount = self.instance.saved_amount
        else:
            if saved_amount is None:
                saved_amount = 0

        if target_amount is not None and saved_amount is not None:
            if saved_amount > target_amount:
                raise serializers.ValidationError({
                    "saved_amount": "Saved amount cannot exceed target amount."
                })

        # Add validations for automation
        is_automated = data.get('is_automated', self.instance.is_automated if self.instance else False)
        auto_save_amount = data.get('auto_save_amount', self.instance.auto_save_amount if self.instance else Decimal('0.00'))
        frequency = data.get('frequency', self.instance.frequency if self.instance else 'Monthly')
        custom_interval_days = data.get('custom_interval_days', self.instance.custom_interval_days if self.instance else 30)
        auto_save_start_date = data.get('auto_save_start_date', self.instance.auto_save_start_date if self.instance else None)

        if is_automated:
            if auto_save_amount <= 0:
                raise serializers.ValidationError({
                    "auto_save_amount": "Auto-save amount must be greater than zero when automated saving is enabled."
                })
            if frequency == 'Custom' and (custom_interval_days is None or custom_interval_days <= 0):
                raise serializers.ValidationError({
                    "custom_interval_days": "Custom interval in days must be greater than zero when Custom frequency is selected."
                })
            if self.instance is None and auto_save_start_date:
                if auto_save_start_date < datetime.date.today():
                    raise serializers.ValidationError({
                        "auto_save_start_date": "Auto-save start date cannot be in the past."
                    })
        return data
