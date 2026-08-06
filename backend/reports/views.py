from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from datetime import date
from expenses.models import Expense
from income.models import Income
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification


def parse_date_filters(request):
    filter_type = request.query_params.get('filter', 'current_month')
    today = date.today()

    if filter_type == 'current_month':
        start = today.replace(day=1)
        end = today
    elif filter_type == 'previous_month':
        first_of_this_month = today.replace(day=1)
        end = first_of_this_month - timedelta_days(1)
        start = end.replace(day=1)
    elif filter_type == 'custom':
        start_str = request.query_params.get('start_date')
        end_str = request.query_params.get('end_date')
        start = date.fromisoformat(start_str) if start_str else today.replace(day=1)
        end = date.fromisoformat(end_str) if end_str else today
    else:
        start = today.replace(day=1)
        end = today

    return start, end


def timedelta_days(n):
    from datetime import timedelta
    return timedelta(days=n)


class MonthlyFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start, end = parse_date_filters(request)
        user = request.user

        total_income = Income.objects.filter(user=user, income_date__range=[start, end]).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=user, expense_date__range=[start, end]).aggregate(total=Sum('amount'))['total'] or 0
        current_balance = total_income - total_expense
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
        total_budget = Budget.objects.filter(user=user).aggregate(total=Sum('budget_amount'))['total'] or 0
        remaining_budget = total_budget - total_expense

        return Response({
            "period": {"start_date": start, "end_date": end},
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "remaining_budget": remaining_budget
        })


class ExpenseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start, end = parse_date_filters(request)
        expenses = Expense.objects.filter(
            user=request.user, expense_date__range=[start, end]
        ).values('title', 'category', 'amount', 'expense_date', 'description')

        return Response({
            "period": {"start_date": start, "end_date": end},
            "expenses": list(expenses)
        })


class SavingsReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        goals = SavingsGoal.objects.filter(user=request.user)
        result = []
        for goal in goals:
            remaining = goal.target_amount - goal.saved_amount
            progress = (goal.saved_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
            result.append({
                "goal_name": goal.goal_name,
                "target_amount": goal.target_amount,
                "saved_amount": goal.saved_amount,
                "remaining_amount": remaining,
                "progress_percentage": round(progress, 2),
                "status": goal.status
            })
        return Response(result)


class FinancialSummaryReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start, end = parse_date_filters(request)
        user = request.user

        total_income = Income.objects.filter(user=user, income_date__range=[start, end]).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=user, expense_date__range=[start, end]).aggregate(total=Sum('amount'))['total'] or 0
        current_balance = total_income - total_expense

        expense_by_category = Expense.objects.filter(
            user=user, expense_date__range=[start, end]
        ).values('category').annotate(total=Sum('amount'))

        income_by_source = Income.objects.filter(
            user=user, income_date__range=[start, end]
        ).values('source').annotate(total=Sum('amount'))

        budgets = Budget.objects.filter(user=user).values('category', 'budget_amount', 'month', 'year')

        savings_goals = SavingsGoal.objects.filter(user=user).values(
            'goal_name', 'target_amount', 'saved_amount', 'status'
        )

        latest_notifications = list(Notification.objects.filter(user=user).order_by('-created_at')[:5].values(
            'title', 'message', 'is_read', 'created_at'
        ))

        return Response({
            "period": {"start_date": start, "end_date": end},
            "financial_summary": {
                "total_income": total_income,
                "total_expense": total_expense,
                "current_balance": current_balance
            },
            "expense_summary": list(expense_by_category),
            "income_summary": list(income_by_source),
            "budget_summary": list(budgets),
            "savings_summary": list(savings_goals),
            "latest_notifications": latest_notifications
        })
