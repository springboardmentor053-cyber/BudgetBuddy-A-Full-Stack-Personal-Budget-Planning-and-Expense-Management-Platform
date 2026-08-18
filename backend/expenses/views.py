from decimal import Decimal
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense, Income, Budget
from .serializers import ExpenseSerializer, IncomeSerializer, BudgetSerializer
from savings.models import SavingsGoal, Notification
from savings.serializers import NotificationSerializer
from savings.views import trigger_notifications_for_user


# ==========================================
# Auth & System Status Helpers
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_status(request):
    return Response({"status": "running"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password or not email:
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_email(email)
    except ValidationError:
        return Response({"email": ["Enter a valid email address."]}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"username": ["A user with that username already exists."]}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"email": ["A user with that email already exists."]}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "message": "User registered successfully"
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    }, status=status.HTTP_200_OK)


# ==========================================
# Expense CRUD Views
# ==========================================

class TotalExpenseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        total = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return Response({"total_expense": float(total)}, status=status.HTTP_200_OK)


class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-expense_date', '-created_at')

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)

        Notification.objects.create(
            user=self.request.user,
            title="Expense Added",
            message=f'Expense "{expense.title}" of ₹{expense.amount:.2f} ({expense.category}) added.',
            notification_type="EXPENSE_ADDED",
            priority="LOW"
        )

        trigger_notifications_for_user(self.request.user)


class ExpenseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        expense = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            title="Expense Updated",
            message=f'Expense "{expense.title}" updated to ₹{expense.amount:.2f}.',
            notification_type="EXPENSE_UPDATED",
            priority="LOW"
        )
        trigger_notifications_for_user(self.request.user)

    def perform_destroy(self, instance):
        title = instance.title
        amount = instance.amount
        user = instance.user
        instance.delete()
        Notification.objects.create(
            user=user,
            title="Expense Deleted",
            message=f'Expense "{title}" of ₹{amount:.2f} deleted.',
            notification_type="EXPENSE_DELETED",
            priority="LOW"
        )
        trigger_notifications_for_user(user)


# ==========================================
# Income CRUD Views
# ==========================================

class IncomeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-income_date', '-created_at')

    def perform_create(self, serializer):
        income = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            title="Income Added",
            message=f'Income from "{income.source}" of ₹{income.amount:.2f} added.',
            notification_type="INCOME_ADDED",
            priority="LOW"
        )


class IncomeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        income = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            title="Income Updated",
            message=f'Income "{income.source}" updated to ₹{income.amount:.2f}.',
            notification_type="INCOME_UPDATED",
            priority="LOW"
        )

    def perform_destroy(self, instance):
        source = instance.source
        amount = instance.amount
        user = instance.user
        instance.delete()
        Notification.objects.create(
            user=user,
            title="Income Deleted",
            message=f'Income "{source}" of ₹{amount:.2f} deleted.',
            notification_type="INCOME_DELETED",
            priority="LOW"
        )


# ==========================================
# Budget CRUD Views
# ==========================================

class BudgetListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by('year', 'month')

    def perform_create(self, serializer):
        budget = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            title="Budget Created",
            message=f'Budget of ₹{budget.budget_amount:.2f} set for {budget.category} ({budget.month}/{budget.year}).',
            notification_type="BUDGET_CREATED",
            priority="MEDIUM"
        )
        trigger_notifications_for_user(self.request.user)


class BudgetRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        budget = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            title="Budget Updated",
            message=f'Budget for {budget.category} updated to ₹{budget.budget_amount:.2f}.',
            notification_type="BUDGET_UPDATED",
            priority="MEDIUM"
        )
        trigger_notifications_for_user(self.request.user)

    def perform_destroy(self, instance):
        user = instance.user
        category = instance.category
        instance.delete()
        Notification.objects.create(
            user=user,
            title="Budget Deleted",
            message=f'Budget for {category} deleted.',
            notification_type="BUDGET_DELETED",
            priority="MEDIUM"
        )
        trigger_notifications_for_user(user)


# ==========================================
# Expanded Dashboard View
# ==========================================

class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        total_income_agg = Income.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_expense_agg = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_savings_agg = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))

        total_income = float(total_income_agg['total'] or 0.0)
        total_expense = float(total_expense_agg['total'] or 0.0)
        total_savings = float(total_savings_agg['total'] or 0.0)

        current_balance = round(total_income - total_expense, 2)

        # Calculate category-wise budget totals & remaining budget
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

        income_count = Income.objects.filter(user=user).count()
        expense_count = Expense.objects.filter(user=user).count()

        financial_summary = {
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
        }

        # Category Breakdown
        cat_group = Expense.objects.filter(user=user).values('category').annotate(amount=Sum('amount')).order_by('-amount')
        category_breakdown = []
        for item in cat_group:
            cat_amt = float(item['amount'])
            pct = round((cat_amt / total_expense * 100), 2) if total_expense > 0 else 0.0
            category_breakdown.append({
                "category": item['category'],
                "amount": cat_amt,
                "percentage": pct
            })

        # Monthly Expenses
        expenses_qs = Expense.objects.filter(user=user).order_by('expense_date')
        monthly_map = {}
        for exp in expenses_qs:
            month_key = exp.expense_date.strftime('%Y-%m')
            monthly_map[month_key] = monthly_map.get(month_key, 0.0) + float(exp.amount)

        monthly_expenses = [
            {"month": k, "amount": round(v, 2)}
            for k, v in monthly_map.items()
        ]

        # Recent Transactions
        recent_incomes = Income.objects.filter(user=user).order_by('-income_date', '-created_at')[:5]
        recent_expenses = Expense.objects.filter(user=user).order_by('-expense_date', '-created_at')[:5]

        serialized_incomes = [
            {
                "id": inc.id,
                "type": "Income",
                "category": None,
                "amount": float(inc.amount),
                "date": inc.income_date.isoformat(),
                "description": inc.description,
                "title": inc.source,
                "created_at": inc.created_at.isoformat()
            }
            for inc in recent_incomes
        ]

        serialized_expenses = [
            {
                "id": exp.id,
                "type": "Expense",
                "category": exp.category,
                "amount": float(exp.amount),
                "date": exp.expense_date.isoformat(),
                "description": exp.description,
                "title": exp.title,
                "created_at": exp.created_at.isoformat()
            }
            for exp in recent_expenses
        ]

        recent_transactions = serialized_incomes + serialized_expenses
        recent_transactions.sort(key=lambda x: x['created_at'], reverse=True)

        # Trigger notification evaluation
        trigger_notifications_for_user(user)

        # Top 5 Notifications
        latest_notifs_qs = Notification.objects.filter(user=user).order_by('-created_at')[:5]
        latest_notifications = NotificationSerializer(latest_notifs_qs, many=True).data

        # Active Savings Goals
        active_goals_qs = SavingsGoal.objects.filter(user=user, status='ACTIVE').order_by('target_date')[:5]
        active_goals = [
            {
                "id": g.id,
                "goal_name": g.goal_name,
                "target_amount": float(g.target_amount),
                "saved_amount": float(g.saved_amount),
                "progress_percentage": round((float(g.saved_amount) / float(g.target_amount) * 100), 2) if float(g.target_amount) > 0 else 0.0,
                "target_date": g.target_date.isoformat()
            }
            for g in active_goals_qs
        ]

        return Response({
            "financial_summary": financial_summary,
            "category_breakdown": category_breakdown,
            "monthly_expenses": monthly_expenses,
            "recent_transactions": recent_transactions[:5],
            "latest_notifications": latest_notifications,
            "active_savings_goals": active_goals,

            # Legacy Root Keys
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "income_count": income_count,
            "expense_count": expense_count,
        }, status=status.HTTP_200_OK)
