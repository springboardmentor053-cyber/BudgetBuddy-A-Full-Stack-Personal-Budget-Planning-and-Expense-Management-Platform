from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from django.db.models import Sum
from expenses.models import Expense
from income.models import Income
from budgets.models import Budget
from .models import Report
from .serializers import ReportSerializer
import datetime

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
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
                category=b.category,
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
