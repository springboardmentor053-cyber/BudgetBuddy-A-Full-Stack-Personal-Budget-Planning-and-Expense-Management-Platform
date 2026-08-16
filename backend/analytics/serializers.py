from rest_framework import serializers


# =====================================================
# FINANCIAL SUMMARY
# =====================================================

class FinancialSummarySerializer(serializers.Serializer):

    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    current_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_savings = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    remaining_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )


# =====================================================
# CATEGORY EXPENSE
# =====================================================

class CategoryExpenseSerializer(serializers.Serializer):

    category = serializers.CharField()

    total_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )


# =====================================================
# MONTHLY EXPENSE
# =====================================================

class MonthlyExpenseSerializer(serializers.Serializer):

    year = serializers.IntegerField()

    month = serializers.CharField()

    total_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )


# =====================================================
# RECENT TRANSACTION
# =====================================================

class RecentTransactionSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    title = serializers.CharField()

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    category = serializers.CharField(
        allow_blank=True
    )

    date = serializers.DateField()

    type = serializers.CharField()


# =====================================================
# NOTIFICATION
# =====================================================

class DashboardNotificationSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    title = serializers.CharField()

    message = serializers.CharField()

    notification_type = serializers.CharField()

    priority = serializers.CharField()

    is_read = serializers.BooleanField()

    created_at = serializers.DateTimeField()


# =====================================================
# SAVINGS GOAL
# =====================================================

class ActiveSavingsGoalSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    title = serializers.CharField()

    target_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    saved_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    percentage = serializers.FloatField()

    target_date = serializers.DateField(
        allow_null=True
    )

    description = serializers.CharField(
        allow_blank=True
    )


# =====================================================
# EXPENSE ANALYSIS ITEM
# =====================================================

class ExpenseAnalysisItemSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    title = serializers.CharField()

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    category = serializers.CharField(
        allow_blank=True
    )

    date = serializers.DateField()


# =====================================================
# EXPENSE ANALYSIS
# =====================================================

class ExpenseAnalysisSerializer(serializers.Serializer):

    highest_expense = ExpenseAnalysisItemSerializer(
        allow_null=True
    )

    lowest_expense = ExpenseAnalysisItemSerializer(
        allow_null=True
    )

    latest_expense = ExpenseAnalysisItemSerializer(
        allow_null=True
    )

    oldest_expense = ExpenseAnalysisItemSerializer(
        allow_null=True
    )


# =====================================================
# COMPLETE DASHBOARD RESPONSE
# =====================================================

class DashboardSerializer(serializers.Serializer):

    financial_summary = FinancialSummarySerializer()

    category_analysis = CategoryExpenseSerializer(
        many=True
    )

    monthly_trend = MonthlyExpenseSerializer(
        many=True
    )

    recent_transactions = RecentTransactionSerializer(
        many=True
    )

    latest_notifications = (
        DashboardNotificationSerializer(
            many=True
        )
    )

    active_savings_goals = (
        ActiveSavingsGoalSerializer(
            many=True
        )
    )

    expense_analysis = ExpenseAnalysisSerializer()