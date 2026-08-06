from notifications.models import Notification
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget, SavingsGoal
from .serializers import BudgetSerializer, SavingsGoalSerializer
from expenses.models import Expense

def check_budget_alerts(budget, request_user):
    total_expense = Expense.objects.filter(
        user=request_user,
        category=budget.category,
        expense_date__month=budget.month,
        expense_date__year=budget.year
    ).aggregate(total=Sum('amount'))['total'] or 0

    utilization = (total_expense / budget.budget_amount * 100) if budget.budget_amount > 0 else 0

    if utilization >= 100 and not budget.alert_100_sent:
        Notification.objects.create(
            user=request_user,
            title='Budget Exceeded',
            message=f'Your {budget.category.title()} Budget has been exceeded.',
            notification_type='budget_alert',
            priority='high'
        )
        budget.alert_100_sent = True
        budget.save()
    elif utilization >= 90 and not budget.alert_90_sent:
        Notification.objects.create(
            user=request_user,
            title='High Warning Alert',
            message=f'You have used 90% of your monthly {budget.category.title()} Budget.',
            notification_type='budget_alert',
            priority='high'
        )
        budget.alert_90_sent = True
        budget.save()
    elif utilization >= 80 and not budget.alert_80_sent:
        Notification.objects.create(
            user=request_user,
            title='Warning Alert',
            message=f'You have used 80% of your monthly {budget.category.title()} Budget.',
            notification_type='budget_alert',
            priority='medium'
        )
        budget.alert_80_sent = True
        budget.save()

    return utilization


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        budget = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            title='Budget Created',
            message=f'Your budget for "{budget.category}" ({budget.month}/{budget.year}) has been created.',
            notification_type='budget_alert',
            priority='medium'
        )

    def perform_update(self, serializer):
        budget = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            title='Budget Updated',
            message=f'Your budget for "{budget.category}" ({budget.month}/{budget.year}) has been updated.',
            notification_type='budget_alert',
            priority='medium'
        )


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user)
        summary = []
        for budget in budgets:
            total_expense = Expense.objects.filter(
                user=request.user,
                category=budget.category,
                expense_date__month=budget.month,
                expense_date__year=budget.year
            ).aggregate(total=Sum('amount'))['total'] or 0

            remaining = budget.budget_amount - total_expense
            overspent = abs(remaining) if remaining < 0 else 0

            summary.append({
                "category": budget.category,
                "month": budget.month,
                "year": budget.year,
                "budget_amount": budget.budget_amount,
                "total_expense": total_expense,
                "remaining_budget": remaining if remaining >= 0 else 0,
                "overspent_amount": overspent
            })
        return Response(summary)


class BudgetAlertView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user)
        result = []
        for budget in budgets:
            total_expense = Expense.objects.filter(
                user=request.user,
                category=budget.category,
                expense_date__month=budget.month,
                expense_date__year=budget.year
            ).aggregate(total=Sum('amount'))['total'] or 0

            utilization = (total_expense / budget.budget_amount * 100) if budget.budget_amount > 0 else 0

            if utilization >= 100:
                alert_level = "Budget Exceeded"
                alert_message = f"Your {budget.category.title()} Budget has been exceeded."
            elif utilization >= 90:
                alert_level = "High Warning"
                alert_message = f"You have used 90% of your monthly {budget.category.title()} Budget."
            elif utilization >= 80:
                alert_level = "Warning"
                alert_message = f"You have used 80% of your monthly {budget.category.title()} Budget."
            else:
                alert_level = "Normal"
                alert_message = f"Your {budget.category.title()} Budget is within safe limits."

            result.append({
                "category": budget.category,
                "budget_amount": budget.budget_amount,
                "total_expense": total_expense,
                "utilization_percentage": round(utilization, 2),
                "alert_level": alert_level,
                "alert_message": alert_message
            })
        return Response(result)