from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from django.db.models import Sum
from django.http import HttpResponse
from expenses.models import Expense
from income.models import Income
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from .models import Report
from .serializers import ReportSerializer
import datetime
import csv

def resolve_date_filter(request):
    """
    Helper function to parse and resolve date filter query parameters.
    Supports filter_type: 'current_month', 'previous_month', or 'custom'.
    Returns (start_date, end_date, month_name).
    """
    filter_type = request.query_params.get('filter_type', 'current_month')
    today = datetime.date.today()
    
    if filter_type == 'current_month':
        start_date = today.replace(day=1)
        # Calculate last day of this month
        next_month = today.replace(day=28) + datetime.timedelta(days=4)
        end_date = next_month - datetime.timedelta(days=next_month.day)
        month_name = today.strftime("%B")
    elif filter_type == 'previous_month':
        # Last day of previous month is 1 day before first day of current month
        end_date = today.replace(day=1) - datetime.timedelta(days=1)
        start_date = end_date.replace(day=1)
        month_name = start_date.strftime("%B")
    elif filter_type == 'custom':
        start_str = request.query_params.get('start_date')
        end_str = request.query_params.get('end_date')
        
        if start_str:
            try:
                start_date = datetime.datetime.strptime(start_str, "%Y-%m-%d").date()
            except ValueError:
                start_date = today.replace(day=1)
        else:
            start_date = today.replace(day=1)
            
        if end_str:
            try:
                end_date = datetime.datetime.strptime(end_str, "%Y-%m-%d").date()
            except ValueError:
                end_date = today
        else:
            end_date = today
            
        month_name = start_date.strftime("%B")
    else:
        # Fallback to current month
        start_date = today.replace(day=1)
        next_month = today.replace(day=28) + datetime.timedelta(days=4)
        end_date = next_month - datetime.timedelta(days=next_month.day)
        month_name = today.strftime("%B")
        
    return start_date, end_date, month_name


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        from savings.services import process_recurring_savings_for_user
        process_recurring_savings_for_user(user)
        
        # 1. Total Income
        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # 2. Total Expenses
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # 3. Balance
        balance = total_income - total_expense
        
        # 4. Recent Transactions
        incomes = Income.objects.filter(user=user).order_by('-income_date')[:10]
        expenses = Expense.objects.filter(user=user).order_by('-date')[:10]
        
        transactions = []
        for inc in incomes:
            transactions.append({
                'id': f"income_{inc.id}",
                'item_id': inc.id,
                'source_or_category': f"{inc.title} ({inc.source})",
                'amount': float(inc.amount),
                'date': inc.income_date.isoformat(),
                'type': 'income'
            })
            
        for exp in expenses:
            transactions.append({
                'id': f"expense_{exp.id}",
                'item_id': exp.id,
                'source_or_category': exp.category,
                'amount': float(exp.amount),
                'date': exp.date.isoformat(),
                'type': 'expense'
            })
            
        transactions.sort(key=lambda x: x['date'], reverse=True)
        recent_transactions = transactions[:10]
        
        # 5. Category Breakdown
        categories = Expense.objects.filter(user=user).values('category').annotate(total=Sum('amount'))
        category_breakdown = {c['category']: float(c['total']) for c in categories}
        
        # 6. Budget Utilization (Current Month)
        current_date = datetime.date.today()
        month_str = current_date.strftime("%B")
        start_of_month = datetime.date(current_date.year, current_date.month, 1)
        if current_date.month == 12:
            end_of_month = datetime.date(current_date.year + 1, 1, 1)
        else:
            end_of_month = datetime.date(current_date.year, current_date.month + 1, 1)
            
        budgets = Budget.objects.filter(user=user, month=month_str)
        budget_utilization = []
        for b in budgets:
            spent = Expense.objects.filter(
                user=user,
                category__iexact=b.category,
                date__gte=start_of_month,
                date__lt=end_of_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            percentage = (spent / b.limit_amount * 100) if b.limit_amount > 0 else 0
            budget_utilization.append({
                'category': b.category,
                'limit': float(b.limit_amount),
                'spent': float(spent),
                'percentage': float(round(percentage, 2))
            })
            
        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'balance': float(balance),
            'recent_transactions': recent_transactions,
            'category_breakdown': category_breakdown,
            'budget_utilization': budget_utilization
        })


class ReportHistoryListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)


class MonthlyFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date, end_date, month_name = resolve_date_filter(request)
        
        total_income = Income.objects.filter(
            user=user, 
            income_date__gte=start_date, 
            income_date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_expense = Expense.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        current_balance = total_income - total_expense
        
        # Aggregate savings goals
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
        
        # Remaining budget for the selected month
        budgets = Budget.objects.filter(user=user, month=month_name)
        total_budget_limit = budgets.aggregate(total=Sum('limit_amount'))['total'] or 0
        
        categories = budgets.values_list('category', flat=True).distinct()
        categories_upper = [c.upper() for c in categories]
        
        total_spent = Expense.objects.filter(
            user=user,
            category__in=categories_upper,
            date__gte=start_date,
            date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
            
        remaining_budget = total_budget_limit - total_spent
        
        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'current_balance': float(current_balance),
            'total_savings': float(total_savings),
            'remaining_budget': float(remaining_budget)
        })


class ExpenseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date, end_date, _ = resolve_date_filter(request)
        
        expenses = Expense.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=end_date
        ).order_by('-date', '-id')
        
        records = []
        for exp in expenses:
            records.append({
                'title': exp.description if exp.description else exp.category,
                'category': exp.category,
                'amount': float(exp.amount),
                'date': exp.date.isoformat(),
                'description': exp.description
            })
            
        return Response(records)


class SavingsReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        goals = SavingsGoal.objects.filter(user=user).order_by('target_date')
        
        records = []
        for g in goals:
            remaining = g.target_amount - g.saved_amount
            progress = (g.saved_amount / g.target_amount * 100) if g.target_amount > 0 else 0
            records.append({
                'goal_name': g.goal_name,
                'target_amount': float(g.target_amount),
                'saved_amount': float(g.saved_amount),
                'remaining_amount': float(remaining),
                'progress_percentage': float(round(progress, 2)),
                'status': g.status
            })
            
        return Response(records)


class CombinedFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date, end_date, month_name = resolve_date_filter(request)
        
        # 1. Financial Summary
        total_income = Income.objects.filter(
            user=user, 
            income_date__gte=start_date, 
            income_date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_expense = Expense.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        current_balance = total_income - total_expense
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
        
        budgets = Budget.objects.filter(user=user, month=month_name)
        total_budget_limit = budgets.aggregate(total=Sum('limit_amount'))['total'] or 0
        
        categories = budgets.values_list('category', flat=True).distinct()
        categories_upper = [c.upper() for c in categories]
        
        total_spent = Expense.objects.filter(
            user=user,
            category__in=categories_upper,
            date__gte=start_date,
            date__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or 0
            
        remaining_budget = total_budget_limit - total_spent
        
        financial_summary = {
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'current_balance': float(current_balance),
            'total_savings': float(total_savings),
            'remaining_budget': float(remaining_budget)
        }
        
        # 2. Expense Summary
        expenses = Expense.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=end_date
        ).order_by('-date')
        
        expense_summary = []
        for exp in expenses:
            expense_summary.append({
                'title': exp.description if exp.description else exp.category,
                'category': exp.category,
                'amount': float(exp.amount),
                'date': exp.date.isoformat(),
                'description': exp.description
            })
            
        # 3. Income Summary
        incomes = Income.objects.filter(
            user=user, 
            income_date__gte=start_date, 
            income_date__lte=end_date
        ).order_by('-income_date')
        
        income_summary = []
        for inc in incomes:
            income_summary.append({
                'title': inc.title,
                'amount': float(inc.amount),
                'source': inc.source,
                'date': inc.income_date.isoformat(),
                'description': inc.description
            })
            
        # 4. Budget Summary
        budget_summary = []
        for b in budgets:
            spent = Expense.objects.filter(
                user=user,
                category__iexact=b.category,
                date__gte=start_date,
                date__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            remaining = b.limit_amount - spent
            pct = (spent / b.limit_amount * 100) if b.limit_amount > 0 else 0
            budget_summary.append({
                'category': b.category,
                'limit_amount': float(b.limit_amount),
                'spent_amount': float(spent),
                'remaining_amount': float(remaining),
                'progress_percentage': float(round(pct, 2))
            })
            
        # 5. Savings Summary
        goals = SavingsGoal.objects.filter(user=user).order_by('target_date')
        savings_summary = []
        for g in goals:
            remaining = g.target_amount - g.saved_amount
            progress = (g.saved_amount / g.target_amount * 100) if g.target_amount > 0 else 0
            savings_summary.append({
                'goal_name': g.goal_name,
                'target_amount': float(g.target_amount),
                'saved_amount': float(g.saved_amount),
                'remaining_amount': float(remaining),
                'progress_percentage': float(round(progress, 2)),
                'status': g.status
            })
            
        # 6. Latest Notifications
        notifications = Notification.objects.filter(user=user).order_by('-created_at')[:5]
        latest_notifications = NotificationSerializer(notifications, many=True).data
        
        return Response({
            'financial_summary': financial_summary,
            'expense_summary': expense_summary,
            'income_summary': income_summary,
            'budget_summary': budget_summary,
            'savings_summary': savings_summary,
            'latest_notifications': latest_notifications
        })


class ExportReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date, end_date, month_name = resolve_date_filter(request)
        export_format = request.query_params.get('export', 'json')
        
        # Fetch transactions
        incomes = Income.objects.filter(
            user=user, 
            income_date__gte=start_date, 
            income_date__lte=end_date
        ).order_by('income_date')
        
        expenses = Expense.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=end_date
        ).order_by('date')
        
        if export_format == 'csv':
            # Create the HttpResponse object with CSV header
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="financial_report_{start_date}_{end_date}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Type', 'Title/Category', 'Amount', 'Date', 'Description'])
            
            # Merge and sort chronologically
            records = []
            for inc in incomes:
                records.append({
                    'type': 'Income',
                    'name': f"{inc.title} ({inc.source})",
                    'amount': float(inc.amount),
                    'date': inc.income_date,
                    'desc': inc.description
                })
            for exp in expenses:
                records.append({
                    'type': 'Expense',
                    'name': exp.category,
                    'amount': float(exp.amount),
                    'date': exp.date,
                    'desc': exp.description
                })
            records.sort(key=lambda x: x['date'])
            
            for r in records:
                writer.writerow([r['type'], r['name'], r['amount'], r['date'].isoformat(), r['desc']])
                
            return response
            
        else:
            # Default to JSON payload
            # 1. Financial Summary
            total_income = incomes.aggregate(total=Sum('amount'))['total'] or 0
            total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0
            current_balance = total_income - total_expense
            total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
            
            budgets = Budget.objects.filter(user=user, month=month_name)
            total_budget_limit = budgets.aggregate(total=Sum('limit_amount'))['total'] or 0
            
            categories = budgets.values_list('category', flat=True).distinct()
            categories_upper = [c.upper() for c in categories]
            
            total_spent = Expense.objects.filter(
                user=user,
                category__in=categories_upper,
                date__gte=start_date,
                date__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or 0
                
            remaining_budget = total_budget_limit - total_spent
            
            financial_summary = {
                'total_income': float(total_income),
                'total_expense': float(total_expense),
                'current_balance': float(current_balance),
                'total_savings': float(total_savings),
                'remaining_budget': float(remaining_budget)
            }
            
            # Formatted list of expenses
            expense_records = []
            for exp in expenses:
                expense_records.append({
                    'title': exp.description if exp.description else exp.category,
                    'category': exp.category,
                    'amount': float(exp.amount),
                    'date': exp.date.isoformat(),
                    'description': exp.description
                })
                
            # Formatted list of incomes
            income_records = []
            for inc in incomes:
                income_records.append({
                    'title': inc.title,
                    'amount': float(inc.amount),
                    'source': inc.source,
                    'date': inc.income_date.isoformat(),
                    'description': inc.description
                })
                
            # Formatted list of budgets
            budget_records = []
            for b in budgets:
                spent = Expense.objects.filter(
                    user=user,
                    category__iexact=b.category,
                    date__gte=start_date,
                    date__lte=end_date
                ).aggregate(total=Sum('amount'))['total'] or 0
                remaining = b.limit_amount - spent
                pct = (spent / b.limit_amount * 100) if b.limit_amount > 0 else 0
                budget_records.append({
                    'category': b.category,
                    'limit_amount': float(b.limit_amount),
                    'spent_amount': float(spent),
                    'remaining_amount': float(remaining),
                    'progress_percentage': float(round(pct, 2))
                })
                
            # Formatted list of savings goals
            goals = SavingsGoal.objects.filter(user=user)
            savings_records = []
            for g in goals:
                remaining = g.target_amount - g.saved_amount
                progress = (g.saved_amount / g.target_amount * 100) if g.target_amount > 0 else 0
                savings_records.append({
                    'goal_name': g.goal_name,
                    'target_amount': float(g.target_amount),
                    'saved_amount': float(g.saved_amount),
                    'remaining_amount': float(remaining),
                    'progress_percentage': float(round(progress, 2)),
                    'status': g.status
                })
                
            return Response({
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'month': month_name,
                'financial_summary': financial_summary,
                'expenses': expense_records,
                'incomes': income_records,
                'budgets': budget_records,
                'savings_goals': savings_records
            })
