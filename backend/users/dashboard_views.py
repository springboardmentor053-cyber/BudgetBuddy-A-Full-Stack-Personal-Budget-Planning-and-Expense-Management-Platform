from itertools import chain
from operator import itemgetter
from datetime import timedelta

from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from budgets.models import Budget
from income.models import Income
from users.models import Expense


class TransactionDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        timeframe = request.query_params.get('timeframe', 'all')
        category = request.query_params.get('category')

        # A month/year pair takes precedence over timeframe.  ``this_month``
        # supplies the current pair when one was not explicitly requested.
        selected_month = selected_year = None
        if month and year:
            try:
                selected_month = int(month)
                selected_year = int(year)
            except (TypeError, ValueError):
                selected_month = selected_year = None
        elif timeframe == 'this_month':
            selected_month = today.month
            selected_year = today.year

        incomes = Income.objects.filter(user=user)
        expenses = Expense.objects.filter(user=user)
        budgets = Budget.objects.filter(user=user)

        if selected_month and selected_year and 1 <= selected_month <= 12:
            incomes = incomes.filter(
                income_date__month=selected_month,
                income_date__year=selected_year,
            )
            expenses = expenses.filter(
                expense_date__month=selected_month,
                expense_date__year=selected_year,
            )
            budgets = budgets.filter(month=selected_month, year=selected_year)
        elif timeframe == 'past_30_days':
            start_date = timezone.now() - timedelta(days=30)
            incomes = incomes.filter(income_date__gte=start_date)
            expenses = expenses.filter(expense_date__gte=start_date)
            budgets = budgets.filter(created_at__gte=start_date)

        if category and category != 'All Categories':
            incomes = incomes.filter(category__iexact=category)
            expenses = expenses.filter(category__iexact=category)

        total_income = incomes.aggregate(total=Sum('amount'))['total'] or 0.0
        total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0.0
        current_balance = float(total_income) - float(total_expense)

        # The filtered budgets define which expense categories count against
        # the displayed budget total.
        active_budgets = budgets
        total_budget = active_budgets.aggregate(total=Sum('budget_amount'))['total'] or 0.0

        # 2. Extract active budget categories
        budget_categories = list(active_budgets.values_list('category', flat=True))

        # 3. Sum filtered expenses ONLY for those active budget categories.
        category_query = Q()
        for cat in budget_categories:
            category_query |= Q(category__iexact=cat)

        if budget_categories:
            budgeted_expenses = expenses.filter(category_query).aggregate(total=Sum('amount'))['total'] or 0.0
        else:
            budgeted_expenses = 0.0

        # 4. Calculate remaining budget
        remaining_budget = max(0.0, float(total_budget) - float(budgeted_expenses))
        overspent_amount = max(0.0, float(budgeted_expenses) - float(total_budget))

        recent_incomes = incomes.order_by('-income_date')[:5]
        recent_expenses = expenses.order_by('-expense_date')[:5]

        income_list = [{
            'id': income.id,
            'type': 'income',
            'title': income.title,
            'amount': float(income.amount),
            'category': income.category,
            'date': income.income_date.strftime('%Y-%m-%d'),
        } for income in recent_incomes]
        expense_list = [{
            'id': expense.id,
            'type': 'expense',
            'title': expense.title,
            'amount': float(expense.amount),
            'category': expense.category,
            'date': expense.expense_date.strftime('%Y-%m-%d'),
        } for expense in recent_expenses]

        recent_transactions = sorted(
            chain(income_list, expense_list),
            key=itemgetter('date'),
            reverse=True,
        )[:5]

        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'current_balance': current_balance,
            'total_budget': float(total_budget),
            'remaining_budget': remaining_budget,
            'overspent_amount': overspent_amount,
            'recent_transactions': recent_transactions,
        })
