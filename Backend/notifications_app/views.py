from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum

# Import your models & serializers (adjust model import paths if needed)
from .models import Notification  # Keep Notification from notifications_app
from expenses.models import Expense
from income.models import Income
from budgets.models import Budget
from savings.models import SavingsGoal
from expenses.serializers import ExpenseSerializer
from income.serializers import IncomeSerializer
from budgets.serializers import BudgetSerializer
from savings.serializers import SavingsGoalSerializer

# Import the helper function from notifications_app
from notifications_app.utils import send_notification


class NotificationListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationAsReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):  # Changed from patch to post
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save()

        return Response(
            {
                "message": "Notification marked as read.",
                "is_read": notification.is_read
            },
            status=status.HTTP_200_OK
        )
# -------------------------------------------------------------
# 1. EXPENSES (EXPENSE_ADDED, BUDGET_WARNING, BUDGET_EXCEEDED)
# -------------------------------------------------------------


class ExpenseCreateAPIView(generics.CreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Save expense for logged-in user
        expense = serializer.save(user=self.request.user)

        # 1. Trigger EXPENSE_ADDED
        send_notification(
            user=self.request.user,
            title="Expense Added",
            message=f"Expense of ₹{expense.amount} added under {expense.category}.",
            notification_type="EXPENSE_ADDED",
            priority="LOW",
        )

        # 2. Check related budget threshold
        budget = Budget.objects.filter(
            user=self.request.user, category=expense.category).first()
        if budget:
            total_spent = Expense.objects.filter(
                user=self.request.user,
                category=expense.category
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            # Exceeded (100%+)
            if total_spent > budget.monthly_limit:
                send_notification(
                    user=self.request.user,
                    title="Budget Exceeded ⚠️",
                    message=f"You exceeded your {budget.category} budget of ₹{budget.monthly_limit}!",
                    notification_type="BUDGET_EXCEEDED",
                    priority="HIGH",
                )
            # Warning (80% to 100%)
            elif total_spent >= (0.8 * float(budget.monthly_limit)):
                send_notification(
                    user=self.request.user,
                    title="Budget Warning ⚡",
                    message=f"You have spent 80% or more of your {budget.category} budget.",
                    notification_type="BUDGET_WARNING",
                    priority="HIGH",
                )


# -------------------------------------------------------------
# 2. INCOME (INCOME_ADDED)
# -------------------------------------------------------------
class IncomeCreateAPIView(generics.CreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        income = serializer.save(user=self.request.user)

        send_notification(
            user=self.request.user,
            title="Income Added",
            message=f"Income of ₹{income.amount} added from {income.source}.",
            notification_type="INCOME_ADDED",
            priority="LOW",
        )


# -------------------------------------------------------------
# 3. BUDGETS (BUDGET_EVENT, BUDGET_INFO)
# -------------------------------------------------------------
class BudgetCreateAPIView(generics.CreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        budget = serializer.save(user=self.request.user)

        send_notification(
            user=self.request.user,
            title="Budget Created",
            message=f"Budget created for {budget.category} with a limit of ₹{budget.monthly_limit}.",
            notification_type="BUDGET_EVENT",
            priority="MEDIUM",
        )


class BudgetUpdateAPIView(generics.UpdateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        budget = serializer.save()

        send_notification(
            user=self.request.user,
            title="Budget Updated",
            message=f"Budget for {budget.category} updated to ₹{budget.monthly_limit}.",
            notification_type="BUDGET_INFO",
            priority="LOW",
        )


# -------------------------------------------------------------
# 4. SAVINGS GOALS (SAVINGS_CREATED, SAVINGS_COMPLETED, GOAL_MILESTONE)
# -------------------------------------------------------------
class SavingsGoalCreateAPIView(generics.CreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)

        send_notification(
            user=self.request.user,
            title="Savings Goal Created",
            message=f"Goal '{goal.goal_name}' created with target ₹{goal.target_amount}.",
            notification_type="SAVINGS_CREATED",
            priority="MEDIUM",
        )


class SavingsGoalUpdateAPIView(generics.UpdateAPIView):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        goal = serializer.save()

        # Check goal completion
        if goal.current_amount >= goal.target_amount:
            send_notification(
                user=self.request.user,
                title="Goal Completed 🎉",
                message=f"Congratulations! You reached your savings goal '{goal.goal_name}' of ₹{goal.target_amount}.",
                notification_type="SAVINGS_COMPLETED",
                priority="HIGH",
            )
        # Check milestone (e.g. 50% reached)
        elif (goal.current_amount / goal.target_amount) >= 0.5:
            send_notification(
                user=self.request.user,
                title="Goal Milestone Reached 🚀",
                message=f"You've crossed 50% for your goal '{goal.goal_name}'!",
                notification_type="GOAL_MILESTONE",
                priority="MEDIUM",
            )


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all marked as read"}, status=status.HTTP_200_OK)
