from decimal import Decimal
from rest_framework import serializers
from expenses.serializers import ExpenseSerializer, IncomeSerializer, BudgetSerializer
from savings.serializers import SavingsGoalSerializer, NotificationSerializer


class MonthlyFinancialReportSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    total_income = serializers.FloatField()
    total_expense = serializers.FloatField()
    current_balance = serializers.FloatField()
    total_budget = serializers.FloatField()
    remaining_budget = serializers.FloatField()
    total_savings = serializers.FloatField()


class ExpenseReportItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField()
    expense_title = serializers.CharField(source='title')
    category = serializers.CharField()
    amount = serializers.FloatField()
    date = serializers.DateField(source='expense_date')
    expense_date = serializers.DateField()
    description = serializers.CharField(allow_blank=True, allow_null=True)


class SavingsReportItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    goal_name = serializers.CharField()
    target_amount = serializers.FloatField()
    saved_amount = serializers.FloatField()
    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    status = serializers.CharField()
    goal_status = serializers.CharField(source='status')

    def get_remaining_amount(self, obj):
        target = Decimal(str(getattr(obj, 'target_amount', 0)))
        saved = Decimal(str(getattr(obj, 'saved_amount', 0)))
        remaining = max(Decimal('0.00'), target - saved)
        return float(remaining.quantize(Decimal('0.01')))

    def get_progress_percentage(self, obj):
        target = Decimal(str(getattr(obj, 'target_amount', 0)))
        saved = Decimal(str(getattr(obj, 'saved_amount', 0)))
        if target <= Decimal('0'):
            return 0.0
        percentage = (saved / target) * Decimal('100')
        return float(min(Decimal('100.00'), percentage).quantize(Decimal('0.01')))


class CombinedFinancialSummaryReportSerializer(serializers.Serializer):
    financial_summary = serializers.DictField()
    expense_summary = serializers.DictField()
    income_summary = serializers.DictField()
    budget_summary = serializers.DictField()
    savings_summary = serializers.DictField()
    latest_notifications = NotificationSerializer(many=True)

    # Backward compatibility fields
    title = serializers.CharField()
    generated_at = serializers.CharField()
    income = serializers.DictField()
    expenses = serializers.DictField()
    savings = serializers.DictField()
    budget = serializers.DictField()
    goal_progress = serializers.ListField()
    recent_transactions = serializers.ListField()
