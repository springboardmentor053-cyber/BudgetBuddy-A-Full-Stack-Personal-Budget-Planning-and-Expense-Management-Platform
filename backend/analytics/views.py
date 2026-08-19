from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum

from income.models import Income
from expenses.models import Expense
from savings.models import SavingsGoal
from budgets.models import Budget
from notifications.models import Notification


class CombinedDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            # 1. Total Income & Expenses
            inc_qs = Income.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum']
            exp_qs = Expense.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum']

            total_income = float(inc_qs) if inc_qs is not None else 0.0
            total_expense = float(exp_qs) if exp_qs is not None else 0.0
            current_balance = total_income - total_expense

            # 2. Total Savings & Active Savings Goals Query
            savings_qs = SavingsGoal.objects.filter(user=user)
            total_savings = float(
                savings_qs.aggregate(Sum('saved_amount'))['saved_amount__sum']
                or savings_qs.aggregate(Sum('current_amount'))['current_amount__sum']
                or 0.0
            )

            active_savings_goals = []
            for goal in savings_qs:
                saved = getattr(goal, 'saved_amount', getattr(goal, 'current_amount', 0.0))
                active_savings_goals.append({
                    "id": goal.id,
                    "goal_name": goal.goal_name,
                    "target_amount": float(goal.target_amount),
                    "saved_amount": float(saved or 0.0),
                    "target_date": str(goal.target_date) if goal.target_date else None
                })

            # 3. Total Budget & Remaining Budget Calculation
            budget_qs = Budget.objects.filter(user=user).aggregate(Sum('budget_amount'))['budget_amount__sum']
            total_budget = float(budget_qs) if budget_qs is not None else 0.0
            remaining_budget = total_budget - total_expense if total_budget > 0 else (current_balance - total_savings)

            # 4. Category Breakdown
            category_analysis = {}
            for exp in Expense.objects.filter(user=user):
                cat = getattr(exp, 'category', 'Uncategorized') or 'Uncategorized'
                category_analysis[cat] = category_analysis.get(cat, 0.0) + float(exp.amount or 0)

            # 5. Monthly Trend
            monthly_trend = {}
            for exp in Expense.objects.filter(user=user):
                dt = getattr(exp, 'date', None) or getattr(exp, 'expense_date', None) or getattr(exp, 'created_at', None)
                m_key = dt.strftime('%b %Y') if dt else 'Recent'
                monthly_trend[m_key] = monthly_trend.get(m_key, 0.0) + float(exp.amount or 0)

            # 6. Recent Transactions
            recent_tx = []
            for inc in Income.objects.filter(user=user).order_by('-id')[:3]:
                t = getattr(inc, 'title', getattr(inc, 'source', 'Income'))
                recent_tx.append({"title": str(t), "amount": float(inc.amount), "type": "INCOME"})
            for exp in Expense.objects.filter(user=user).order_by('-id')[:3]:
                t = getattr(exp, 'title', getattr(exp, 'category', 'Expense'))
                recent_tx.append({"title": str(t), "amount": float(exp.amount), "type": "EXPENSE"})

            # 7. Latest Notifications
            latest_notifications = []
            try:
                for notif in Notification.objects.filter(user=user).order_by('-id')[:5]:
                    latest_notifications.append({
                        "id": notif.id,
                        "title": notif.title,
                        "message": notif.message
                    })
            except Exception:
                latest_notifications = []

            return Response({
                "financial_summary": {
                    "total_income": total_income,
                    "total_expense": total_expense,
                    "current_balance": current_balance,
                    "total_savings": total_savings,
                    "remaining_budget": remaining_budget
                },
                "category_wise_analysis": category_analysis,
                "monthly_trend": monthly_trend,
                "recent_transactions": recent_tx,
                "latest_notifications": latest_notifications,
                "active_savings_goals": active_savings_goals
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExtremeExpensesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            expenses = Expense.objects.filter(user=user)

            if not expenses.exists():
                return Response({
                    "highest_expense": None,
                    "lowest_expense": None,
                    "latest_expense": None,
                    "oldest_expense": None
                }, status=status.HTTP_200_OK)

            highest = expenses.order_by('-amount').first()
            lowest = expenses.order_by('amount').first()
            latest = expenses.order_by('-id').first()
            oldest = expenses.order_by('id').first()

            def format_item(e):
                if not e:
                    return None
                t = getattr(e, 'title', getattr(e, 'category', 'Expense'))
                return {"title": str(t), "amount": float(e.amount)}

            return Response({
                "highest_expense": format_item(highest),
                "lowest_expense": format_item(lowest),
                "latest_expense": format_item(latest),
                "oldest_expense": format_item(oldest)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)