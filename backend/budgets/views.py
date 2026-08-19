from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense
from income.models import Income

# Task 3 & Task 6: Protected CRUD APIs
class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Task 4: Budget Summary API per Category
class BudgetSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not category or not month or not year:
            return Response(
                {"error": "Please provide category, month, and year parameters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            budget = Budget.objects.get(user=request.user, category=category, month=month, year=year)
            budget_amount = float(budget.budget_amount)
        except Budget.DoesNotExist:
            return Response({"error": "No budget found for this category and time period."}, status=status.HTTP_404_NOT_FOUND)

        # ✅ FIXED: Used date__month and date__year
        expenses_aggregate = Expense.objects.filter(
            user=request.user,
            category=category,
            date__month=month,
            date__year=year
        ).aggregate(Sum('amount'))

        total_expense = float(expenses_aggregate['amount__sum'] or 0.0)
        remaining_budget = budget_amount - total_expense
        overspent = total_expense > budget_amount

        return Response({
            "category": category,
            "budget_amount": budget_amount,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "overspent": overspent
        })


# Page 2: Transaction Dashboard API
class TransactionDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        total_income = float(Income.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        total_expense = float(Expense.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        current_balance = total_income - total_expense

        total_budget = float(Budget.objects.filter(user=user).aggregate(Sum('budget_amount'))['budget_amount__sum'] or 0.0)
        remaining_budget = total_budget - total_expense

        # ✅ FIXED: Changed -expense_date to -date
        recent_expenses = list(Expense.objects.filter(user=user).order_by('-date')[:5].values('id', 'title', 'amount', 'category', 'date'))
        for exp in recent_expenses:
            exp['type'] = 'EXPENSE'

        # Safely handle Income date field (income_date vs date)
        try:
            recent_incomes = list(Income.objects.filter(user=user).order_by('-income_date')[:5].values('id', 'title', 'amount', 'source', 'income_date'))
        except Exception:
            recent_incomes = list(Income.objects.filter(user=user).order_by('-date')[:5].values('id', 'title', 'amount', 'source', 'date'))

        for inc in recent_incomes:
            inc['type'] = 'INCOME'

        recent_transactions = sorted(
            recent_expenses + recent_incomes,
            key=lambda x: str(x.get('date') or x.get('expense_date') or x.get('income_date')),
            reverse=True
        )[:5]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "recent_transactions": recent_transactions
        })


# Task 5: Budget Alert API
class BudgetAlertView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        budgets = Budget.objects.filter(user=user)
        alerts_data = []

        for budget in budgets:
            # ✅ FIXED: Used date__month and date__year
            total_expense = Expense.objects.filter(
                user=user, 
                category=budget.category,
                date__month=budget.month,
                date__year=budget.year
            ).aggregate(total=Sum('amount'))['total'] or 0.0

            budget_amt = float(budget.budget_amount)
            total_exp = float(total_expense)
            utilization = (total_exp / budget_amt) * 100 if budget_amt > 0 else 0.0

            if utilization >= 100:
                alert_level = "Budget Exceeded"
                alert_message = f"Budget Exceeded: Your budget for '{budget.category}' has been exceeded."
            elif utilization >= 90:
                alert_level = "High Warning Alert"
                alert_message = f"High Alert: You have used {int(utilization)}% of your monthly {budget.category} Budget."
            elif utilization >= 80:
                alert_level = "Warning Alert"
                alert_message = f"Warning: You have used {int(utilization)}% of your monthly {budget.category} Budget."
            else:
                alert_level = "Normal"
                alert_message = f"You have used {round(utilization, 1)}% of your budget."

            alerts_data.append({
                "budget_category": budget.category,
                "budget_amount": budget_amt,
                "total_expense": total_exp,
                "budget_utilization_percentage": round(utilization, 2),
                "alert_level": alert_level,
                "alert_message": alert_message
            })

        return Response(alerts_data, status=status.HTTP_200_OK)