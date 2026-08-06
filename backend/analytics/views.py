from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from django.db.models.functions import ExtractMonth, ExtractYear
from expenses.models import Expense
from income.models import Income
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification

MONTH_NAMES = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December'
}


def get_financial_summary(user):
    total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    current_balance = total_income - total_expense
    total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
    total_budget = Budget.objects.filter(user=user).aggregate(total=Sum('budget_amount'))['total'] or 0
    remaining_budget = total_budget - total_expense
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "current_balance": current_balance,
        "total_savings": total_savings,
        "remaining_budget": remaining_budget
    }


def get_category_analysis(user):
    data = Expense.objects.filter(user=user).values('category').annotate(total=Sum('amount')).order_by('-total')
    return {item['category']: item['total'] for item in data}


def get_monthly_trend(user):
    data = Expense.objects.filter(user=user).annotate(
        month=ExtractMonth('expense_date'), year=ExtractYear('expense_date')
    ).values('month', 'year').annotate(total=Sum('amount')).order_by('year', 'month')
    return [{"month": MONTH_NAMES[item['month']], "year": item['year'], "total": item['total']} for item in data]


def get_highest_lowest(user):
    expenses = Expense.objects.filter(user=user)
    if not expenses.exists():
        return {"highest_expense": None, "lowest_expense": None, "latest_expense": None, "oldest_expense": None}
    highest = expenses.order_by('-amount').first()
    lowest = expenses.order_by('amount').first()
    latest = expenses.order_by('-expense_date').first()
    oldest = expenses.order_by('expense_date').first()

    def fmt(e):
        return {"id": e.id, "title": e.title, "amount": e.amount, "category": e.category, "expense_date": e.expense_date}

    return {
        "highest_expense": fmt(highest),
        "lowest_expense": fmt(lowest),
        "latest_expense": fmt(latest),
        "oldest_expense": fmt(oldest)
    }


class FinancialSummaryAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(get_financial_summary(request.user))


class CategoryAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(get_category_analysis(request.user))


class MonthlyTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(get_monthly_trend(request.user))


class HighestLowestExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(get_highest_lowest(request.user))


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        recent_transactions = list(Expense.objects.filter(user=user).order_by('-created_at')[:5].values(
            'id', 'title', 'amount', 'category', 'expense_date'
        ))
        latest_notifications = list(Notification.objects.filter(user=user).order_by('-created_at')[:5].values(
            'id', 'title', 'message', 'is_read', 'created_at'
        ))
        active_goals = list(SavingsGoal.objects.filter(user=user, status='active').values(
            'id', 'goal_name', 'target_amount', 'saved_amount', 'target_date'
        ))

        return Response({
            "financial_summary": get_financial_summary(user),
            "category_wise_analysis": get_category_analysis(user),
            "monthly_trend": get_monthly_trend(user),
            "recent_transactions": recent_transactions,
            "latest_notifications": latest_notifications,
            "active_savings_goals": active_goals
        })
