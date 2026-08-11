from rest_framework import serializers


class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()


class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class FinancialSummaryResponseSerializer(
    serializers.Serializer
):
    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    current_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


class RecentTransactionSerializer(
    serializers.Serializer
):
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    date = serializers.DateField()
    source = serializers.CharField(
        required=False
    )
    category = serializers.CharField(
        required=False
    )
    description = serializers.CharField(
        allow_blank=True,
        required=False,
    )


class DashboardResponseSerializer(
    serializers.Serializer
):
    month = serializers.CharField()
    year = serializers.IntegerField()

    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    current_month_expense = (
        serializers.DecimalField(
            max_digits=12,
            decimal_places=2,
        )
    )

    remaining_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    recent_transactions = (
        RecentTransactionSerializer(
            many=True
        )
    )


class MonthlyExpenseItemSerializer(
    serializers.Serializer
):
    month_number = serializers.IntegerField()
    month = serializers.CharField()

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


class MonthlyExpenseTrendResponseSerializer(
    serializers.Serializer
):
    year = serializers.IntegerField()

    monthly_expenses = (
        MonthlyExpenseItemSerializer(
            many=True
        )
    )


class CategoryExpenseItemSerializer(
    serializers.Serializer
):
    category = serializers.CharField()

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    percentage = serializers.FloatField()


class CategoryExpenseResponseSerializer(
    serializers.Serializer
):
    month = serializers.CharField()
    month_number = serializers.IntegerField()
    year = serializers.IntegerField()

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    categories = CategoryExpenseItemSerializer(
        many=True
    )


class IncomeExpenseResponseSerializer(
    serializers.Serializer
):
    month = serializers.CharField()
    month_number = serializers.IntegerField()
    year = serializers.IntegerField()

    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = serializers.CharField()


class SavingsGoalReportItemSerializer(
    serializers.Serializer
):
    id = serializers.IntegerField()
    title = serializers.CharField()

    target_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    saved_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    progress_percentage = (
        serializers.FloatField()
    )

    target_date = serializers.DateField(
        allow_null=True
    )


class SavingsReportResponseSerializer(
    serializers.Serializer
):
    total_goals = serializers.IntegerField()

    total_target = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_saved = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    remaining_amount = (
        serializers.DecimalField(
            max_digits=12,
            decimal_places=2,
        )
    )

    overall_progress = serializers.FloatField()

    goals = SavingsGoalReportItemSerializer(
        many=True
    )


class CategoryBreakdownSerializer(
    serializers.Serializer
):
    category = serializers.CharField()

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


class MonthlyIncomeSerializer(
    serializers.Serializer
):
    total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


class MonthlyExpenseSerializer(
    serializers.Serializer
):
    total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    category_breakdown = (
        CategoryBreakdownSerializer(
            many=True
        )
    )


class MonthlyBudgetSerializer(
    serializers.Serializer
):
    total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    spent = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    remaining = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    usage_percentage = (
        serializers.FloatField()
    )

    status = serializers.CharField()


class MonthlySavingsSerializer(
    serializers.Serializer
):
    total_target = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_saved = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    remaining = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


class MonthlyFinancialReportResponseSerializer(
    serializers.Serializer
):
    month = serializers.CharField()
    month_number = serializers.IntegerField()
    year = serializers.IntegerField()

    income = MonthlyIncomeSerializer()
    expense = MonthlyExpenseSerializer()
    budget = MonthlyBudgetSerializer()
    savings = MonthlySavingsSerializer()

    balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )