from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from expenses.models import Expense
from income.models import Income
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification
from expenses.serializers import ExpenseSerializer
from savings.serializers import SavingsGoalSerializer
from notifications.serializers import NotificationSerializer
import datetime

class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Total Income
        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # 2. Total Expense
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        
        # 3. Current Balance
        current_balance = total_income - total_expense
        
        # 4. Total Savings
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
        
        # 5. Remaining Budget
        # Calculated as total budget limit for the current month minus expenses in those categories in current month
        today = datetime.date.today()
        month_str = today.strftime("%B")
        start_of_month = datetime.date(today.year, today.month, 1)
        if today.month == 12:
            end_of_month = datetime.date(today.year + 1, 1, 1)
        else:
            end_of_month = datetime.date(today.year, today.month + 1, 1)
            
        budgets = Budget.objects.filter(user=user, month=month_str)
        total_budget_limit = budgets.aggregate(total=Sum('limit_amount'))['total'] or 0
        
        categories = budgets.values_list('category', flat=True).distinct()
        categories_upper = [c.upper() for c in categories]
        
        total_spent = Expense.objects.filter(
            user=user,
            category__in=categories_upper,
            date__gte=start_of_month,
            date__lt=end_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0
            
        remaining_budget = total_budget_limit - total_spent
        
        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'current_balance': float(current_balance),
            'total_savings': float(total_savings),
            'remaining_budget': float(remaining_budget),
        })


class CategoryExpenseAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        categories = Expense.objects.filter(user=user).values('category').annotate(total=Sum('amount'))
        
        # Return as a dictionary with Title Cased keys matching the frontend display requirements
        category_breakdown = {}
        for c in categories:
            category_breakdown[c['category'].title()] = float(c['total'])
            
        return Response(category_breakdown)


class MonthlyExpenseTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        expenses = Expense.objects.filter(user=user)
        
        month_names = {
            1: "January", 2: "February", 3: "March", 4: "April",
            5: "May", 6: "June", 7: "July", 8: "August",
            9: "September", 10: "October", 11: "November", 12: "December"
        }
        
        monthly_totals = {}
        for exp in expenses:
            month_name = month_names[exp.date.month]
            monthly_totals[month_name] = monthly_totals.get(month_name, 0) + float(exp.amount)
            
        # Return trend in chronological calendar order
        sorted_trend = {}
        for m_num in range(1, 13):
            m_name = month_names[m_num]
            if m_name in monthly_totals:
                sorted_trend[m_name] = monthly_totals[m_name]
                
        return Response(sorted_trend)


class ExpenseExtremesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        highest = Expense.objects.filter(user=user).order_by('-amount').first()
        lowest = Expense.objects.filter(user=user).order_by('amount').first()
        latest = Expense.objects.filter(user=user).order_by('-date', '-id').first()
        oldest = Expense.objects.filter(user=user).order_by('date', 'id').first()
        
        return Response({
            'highest_expense': ExpenseSerializer(highest).data if highest else None,
            'lowest_expense': ExpenseSerializer(lowest).data if lowest else None,
            'latest_expense': ExpenseSerializer(latest).data if latest else None,
            'oldest_expense': ExpenseSerializer(oldest).data if oldest else None,
        })


class AnalyticsDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        from savings.services import process_recurring_savings_for_user
        process_recurring_savings_for_user(user)
        
        # 1. Financial Summary
        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        current_balance = total_income - total_expense
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
        
        today = datetime.date.today()
        month_str = today.strftime("%B")
        start_of_month = datetime.date(today.year, today.month, 1)
        if today.month == 12:
            end_of_month = datetime.date(today.year + 1, 1, 1)
        else:
            end_of_month = datetime.date(today.year, today.month + 1, 1)
            
        budgets = Budget.objects.filter(user=user, month=month_str)
        total_budget_limit = budgets.aggregate(total=Sum('limit_amount'))['total'] or 0
        
        categories = budgets.values_list('category', flat=True).distinct()
        categories_upper = [c.upper() for c in categories]
        
        total_spent = Expense.objects.filter(
            user=user,
            category__in=categories_upper,
            date__gte=start_of_month,
            date__lt=end_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0
            
        remaining_budget = total_budget_limit - total_spent
        
        financial_summary = {
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'current_balance': float(current_balance),
            'total_savings': float(total_savings),
            'remaining_budget': float(remaining_budget),
        }
        
        # 2. Category-wise Analysis
        categories = Expense.objects.filter(user=user).values('category').annotate(total=Sum('amount'))
        category_breakdown = {c['category'].title(): float(c['total']) for c in categories}
        
        # 3. Monthly Trend
        month_names = {
            1: "January", 2: "February", 3: "March", 4: "April",
            5: "May", 6: "June", 7: "July", 8: "August",
            9: "September", 10: "October", 11: "November", 12: "December"
        }
        expenses_all = Expense.objects.filter(user=user)
        monthly_totals = {}
        for exp in expenses_all:
            m_name = month_names[exp.date.month]
            monthly_totals[m_name] = monthly_totals.get(m_name, 0) + float(exp.amount)
            
        monthly_trend = {}
        for m_num in range(1, 13):
            m_name = month_names[m_num]
            if m_name in monthly_totals:
                monthly_trend[m_name] = monthly_totals[m_name]
                
        # 4. Recent Transactions (latest 10 combined)
        incomes_q = Income.objects.filter(user=user).order_by('-income_date')[:10]
        expenses_q = Expense.objects.filter(user=user).order_by('-date')[:10]
        
        transactions = []
        for inc in incomes_q:
            transactions.append({
                'id': f"income_{inc.id}",
                'item_id': inc.id,
                'source_or_category': f"{inc.title} ({inc.source})",
                'amount': float(inc.amount),
                'date': inc.income_date.isoformat(),
                'type': 'income'
            })
            
        for exp in expenses_q:
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
        
        # 5. Latest Notifications (latest 5)
        notifications_q = Notification.objects.filter(user=user).order_by('-created_at')[:5]
        latest_notifications = NotificationSerializer(notifications_q, many=True).data
        
        # 6. Active Savings Goals (Pending or In Progress)
        savings_goals_q = SavingsGoal.objects.filter(
            user=user, 
            status__in=['Pending', 'In Progress']
        ).order_by('target_date')
        active_savings_goals = SavingsGoalSerializer(savings_goals_q, many=True).data
        
        return Response({
            'financial_summary': financial_summary,
            'category_wise_analysis': category_breakdown,
            'monthly_trend': monthly_trend,
            'recent_transactions': recent_transactions,
            'latest_notifications': latest_notifications,
            'active_savings_goals': active_savings_goals,
        })
