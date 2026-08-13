from decimal import Decimal
from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SavingsGoal, Notification
from .serializers import SavingsGoalSerializer, NotificationSerializer
from .utils import send_budget_alert_email
from expenses.models import Expense, Income, Budget


def trigger_notifications_for_user(user):
    """
    Helper function to check budget limits and generate notifications if needed.
    Prevents duplicate notifications per user, budget category, month/year, and threshold.
    Also sends budget alert emails via SMTP for new threshold notifications.
    """
    budgets = Budget.objects.filter(user=user)
    for b in budgets:
        exp_sum = Expense.objects.filter(
            user=user,
            category=b.category,
            expense_date__year=b.year,
            expense_date__month=b.month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        b_amount = Decimal(str(b.budget_amount))
        if b_amount <= Decimal('0'):
            continue

        ratio = exp_sum / b_amount
        budget_tag = f"({b.category} {b.month}/{b.year})"

        # Threshold 1: >= 80% (BUDGET_80_PERCENT, Priority LOW)
        if ratio >= Decimal('0.80'):
            if not Notification.objects.filter(
                user=user,
                notification_type="BUDGET_80_PERCENT",
                message__icontains=budget_tag
            ).exists():
                msg = f"Your expenses for {b.category} ({b.month}/{b.year}) have reached {ratio*100:.1f}% of your budget limit. {budget_tag}"
                Notification.objects.create(
                    user=user,
                    title="Budget Reached 80%",
                    message=msg,
                    notification_type="BUDGET_80_PERCENT",
                    priority="LOW"
                )
                send_budget_alert_email(user, b.category, b_amount, exp_sum, '80')

        # Threshold 2: >= 90% (BUDGET_90_PERCENT, Priority MEDIUM)
        if ratio >= Decimal('0.90'):
            if not Notification.objects.filter(
                user=user,
                notification_type="BUDGET_90_PERCENT",
                message__icontains=budget_tag
            ).exists():
                msg = f"Your expenses for {b.category} ({b.month}/{b.year}) have reached {ratio*100:.1f}% of your budget limit. {budget_tag}"
                Notification.objects.create(
                    user=user,
                    title="Budget Reached 90%",
                    message=msg,
                    notification_type="BUDGET_90_PERCENT",
                    priority="MEDIUM"
                )
                send_budget_alert_email(user, b.category, b_amount, exp_sum, '90')

        # Threshold 3: >= 100% (BUDGET_EXCEEDED, Priority HIGH)
        if ratio >= Decimal('1.00'):
            if not Notification.objects.filter(
                user=user,
                notification_type="BUDGET_EXCEEDED",
                message__icontains=budget_tag
            ).exists():
                msg = f"Your expenses for {b.category} ({b.month}/{b.year}) reached ₹{exp_sum:.2f}, exceeding your budget limit of ₹{b_amount:.2f}. {budget_tag}"
                Notification.objects.create(
                    user=user,
                    title="Budget Exceeded Limit",
                    message=msg,
                    notification_type="BUDGET_EXCEEDED",
                    priority="HIGH"
                )
                send_budget_alert_email(user, b.category, b_amount, exp_sum, '100')



# ==========================================
# Savings Goal CRUD Views
# ==========================================

class SavingsGoalListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavingsGoalSerializer

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        goal_tag = f"[{goal.goal_name}]"

        Notification.objects.create(
            user=self.request.user,
            title="Goal Created",
            message=f"Savings goal '{goal.goal_name}' with a target of ₹{goal.target_amount:.2f} has been created. {goal_tag}",
            notification_type="GOAL_CREATED",
            priority="MEDIUM"
        )

        if goal.target_amount > 0:
            percentage = (goal.saved_amount / goal.target_amount) * 100
            if goal.saved_amount >= goal.target_amount:
                goal.status = 'COMPLETED'
                goal.save(update_fields=['status'])
                if not Notification.objects.filter(user=self.request.user, notification_type="GOAL_ACHIEVED", message__icontains=goal_tag).exists():
                    Notification.objects.create(
                        user=self.request.user,
                        title="Goal Achieved",
                        message=f"Congratulations! You have achieved your savings goal '{goal.goal_name}'. {goal_tag}",
                        notification_type="GOAL_ACHIEVED",
                        priority="HIGH"
                    )
            elif percentage >= 80:
                if not Notification.objects.filter(user=self.request.user, notification_type="GOAL_80_PERCENT", message__icontains=goal_tag).exists():
                    Notification.objects.create(
                        user=self.request.user,
                        title="Goal Reached 80%",
                        message=f"Great job! Your savings goal '{goal.goal_name}' has reached {percentage:.1f}% of target. {goal_tag}",
                        notification_type="GOAL_80_PERCENT",
                        priority="LOW"
                    )


class SavingsGoalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavingsGoalSerializer

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        goal = serializer.save()
        goal_tag = f"[{goal.goal_name}]"

        if goal.target_amount > 0:
            percentage = (goal.saved_amount / goal.target_amount) * 100

            if goal.saved_amount >= goal.target_amount:
                if goal.status != 'COMPLETED':
                    goal.status = 'COMPLETED'
                    goal.save(update_fields=['status'])
                if not Notification.objects.filter(user=self.request.user, notification_type="GOAL_ACHIEVED", message__icontains=goal_tag).exists():
                    Notification.objects.create(
                        user=self.request.user,
                        title="Goal Achieved",
                        message=f"Congratulations! You have achieved your savings goal '{goal.goal_name}'. {goal_tag}",
                        notification_type="GOAL_ACHIEVED",
                        priority="HIGH"
                    )
            elif percentage >= 80:
                if not Notification.objects.filter(user=self.request.user, notification_type="GOAL_80_PERCENT", message__icontains=goal_tag).exists():
                    Notification.objects.create(
                        user=self.request.user,
                        title="Goal Reached 80%",
                        message=f"Great job! Your savings goal '{goal.goal_name}' has reached {percentage:.1f}% of target. {goal_tag}",
                        notification_type="GOAL_80_PERCENT",
                        priority="LOW"
                    )


class SavingsGoalProgressAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        goals = SavingsGoal.objects.filter(user=request.user)
        progress_list = []

        for goal in goals:
            target = Decimal(str(goal.target_amount))
            saved = Decimal(str(goal.saved_amount))
            remaining = max(Decimal('0.00'), target - saved)
            percentage = (saved / target * Decimal('100')) if target > Decimal('0') else Decimal('0.00')

            progress_list.append({
                "id": goal.id,
                "goal_name": goal.goal_name,
                "target_amount": float(target),
                "saved_amount": float(saved),
                "remaining_amount": float(remaining.quantize(Decimal('0.01'))),
                "progress_percentage": float(min(Decimal('100.00'), percentage).quantize(Decimal('0.01'))),
                "goal_status": goal.status,
                "target_date": goal.target_date.isoformat()
            })

        if len(progress_list) == 1 and request.query_params.get('single') == 'true':
            return Response(progress_list[0], status=status.HTTP_200_OK)

        return Response(progress_list, status=status.HTTP_200_OK)


# ==========================================
# Notification System APIs
# ==========================================

class NotificationListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        trigger_notifications_for_user(self.request.user)
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationUnreadCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        trigger_notifications_for_user(request.user)
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": unread_count}, status=status.HTTP_200_OK)


class NotificationMarkReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            serializer = NotificationSerializer(notification)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)



class NotificationMarkAllReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)


class NotificationDestroyAPIView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class AnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        total_income_val = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_expense_val = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_savings_val = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or Decimal('0.00')

        total_income = float(total_income_val)
        total_expense = float(total_expense_val)
        total_savings = float(total_savings_val)

        current_balance = round(total_income - total_expense, 2)

        # Calculate Category-wise Budget Summary
        budgets_qs = Budget.objects.filter(user=user)
        total_budget_val = Decimal('0.00')
        total_remaining_val = Decimal('0.00')

        for b in budgets_qs:
            b_amt = Decimal(str(b.budget_amount))
            total_budget_val += b_amt

            cat_exp = Expense.objects.filter(
                user=user,
                category=b.category,
                expense_date__year=b.year,
                expense_date__month=b.month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            b_rem = b_amt - cat_exp
            total_remaining_val += b_rem

        total_budget = float(round(total_budget_val, 2))
        remaining_budget = float(round(total_remaining_val, 2))

        savings_rate = round((total_savings / total_income) * 100, 2) if total_income > 0 else 0.00

        cat_group = Expense.objects.filter(user=user).values('category').annotate(amount=Sum('amount')).order_by('-amount')
        category_breakdown = []
        top_spending_category = "N/A"

        if cat_group:
            top_spending_category = cat_group[0]['category']

        for item in cat_group:
            cat_amt = float(item['amount'])
            pct = round((cat_amt / total_expense * 100), 2) if total_expense > 0 else 0.0
            category_breakdown.append({
                "category": item['category'],
                "amount": cat_amt,
                "percentage": pct
            })

        expenses_qs = Expense.objects.filter(user=user).order_by('expense_date')
        monthly_map = {}
        for exp in expenses_qs:
            month_key = exp.expense_date.strftime('%Y-%m')
            monthly_map[month_key] = monthly_map.get(month_key, 0.0) + float(exp.amount)

        monthly_expenses = [
            {"month": k, "amount": round(v, 2)}
            for k, v in monthly_map.items()
        ]

        # Income vs Expense
        income_vs_expense = {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_balance": current_balance,
            "savings_rate": savings_rate
        }

        # Budget Utilization
        budget_utilization = []
        for b in budgets_qs:
            b_amt = float(b.budget_amount)
            cat_exp = float(Expense.objects.filter(
                user=user, category=b.category, expense_date__year=b.year, expense_date__month=b.month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00'))
            pct = round((cat_exp / b_amt * 100), 2) if b_amt > 0 else 0.0
            status_str = "NORMAL"
            if pct >= 100:
                status_str = "EXCEEDED"
            elif pct >= 90:
                status_str = "CRITICAL"
            elif pct >= 80:
                status_str = "WARNING"
            budget_utilization.append({
                "id": b.id,
                "category": b.category,
                "budget_amount": b_amt,
                "spent_amount": round(cat_exp, 2),
                "remaining_amount": round(b_amt - cat_exp, 2),
                "utilization_percentage": pct,
                "month": b.month,
                "year": b.year,
                "status": status_str
            })

        # Savings Goal Progress
        savings_goals = SavingsGoal.objects.filter(user=user)
        savings_goal_progress = [
            {
                "id": g.id,
                "goal_name": g.goal_name,
                "target_amount": float(g.target_amount),
                "saved_amount": float(g.saved_amount),
                "remaining_amount": float(max(Decimal('0.00'), Decimal(str(g.target_amount)) - Decimal(str(g.saved_amount)))),
                "progress_percentage": round((float(g.saved_amount) / float(g.target_amount) * 100), 2) if float(g.target_amount) > 0 else 0.0,
                "status": g.status,
                "target_date": g.target_date.isoformat()
            }
            for g in savings_goals
        ]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "total_savings": total_savings,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "monthly_expenses": monthly_expenses,
            "category_breakdown": category_breakdown,
            "top_spending_category": top_spending_category,
            "savings_rate": savings_rate,
            "income_vs_expense": income_vs_expense,
            "budget_utilization": budget_utilization,
            "savings_goal_progress": savings_goal_progress,
        }, status=status.HTTP_200_OK)



class ReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        total_income_val = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_expense_val = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_saved_val = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or Decimal('0.00')

        budgets_qs = Budget.objects.filter(user=user)
        total_budget_val = Decimal('0.00')
        total_remaining_val = Decimal('0.00')

        for b in budgets_qs:
            b_amt = Decimal(str(b.budget_amount))
            total_budget_val += b_amt

            cat_exp = Expense.objects.filter(
                user=user,
                category=b.category,
                expense_date__year=b.year,
                expense_date__month=b.month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            b_rem = b_amt - cat_exp
            total_remaining_val += b_rem

        incomes = Income.objects.filter(user=user).order_by('-income_date')[:10]
        expenses = Expense.objects.filter(user=user).order_by('-expense_date')[:10]
        goals = SavingsGoal.objects.filter(user=user)

        goal_progress_data = [
            {
                "goal_name": g.goal_name,
                "target_amount": float(g.target_amount),
                "saved_amount": float(g.saved_amount),
                "remaining_amount": float(max(Decimal('0.00'), Decimal(str(g.target_amount)) - Decimal(str(g.saved_amount)))),
                "progress_percentage": float(round((g.saved_amount / g.target_amount * 100), 2)) if g.target_amount > 0 else 0.0,
                "goal_status": g.status,
            }
            for g in goals
        ]

        recent_incomes_serialized = [
            {"id": inc.id, "type": "Income", "source": inc.source, "amount": float(inc.amount), "date": inc.income_date.isoformat()}
            for inc in incomes
        ]
        recent_expenses_serialized = [
            {"id": exp.id, "type": "Expense", "title": exp.title, "category": exp.category, "amount": float(exp.amount), "date": exp.expense_date.isoformat()}
            for exp in expenses
        ]

        recent_transactions = recent_incomes_serialized + recent_expenses_serialized
        recent_transactions.sort(key=lambda x: x['date'], reverse=True)

        report_data = {
            "title": f"Monthly Financial Summary Report for {user.username}",
            "generated_at": timezone.now().isoformat(),
            "income": {
                "total": float(total_income_val),
                "count": Income.objects.filter(user=user).count()
            },
            "expenses": {
                "total": float(total_expense_val),
                "count": Expense.objects.filter(user=user).count()
            },
            "savings": {
                "total_savings": float(total_saved_val),
                "goals_count": goals.count()
            },
            "budget": {
                "total_budget": float(total_budget_val),
                "remaining_budget": float(total_remaining_val),
                "allocated_categories": budgets_qs.count()
            },
            "goal_progress": goal_progress_data,
            "recent_transactions": recent_transactions[:10]
        }

        return Response(report_data, status=status.HTTP_200_OK)
