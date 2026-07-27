from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense
from income.models import Income

# Handles GET (View Budgets) and POST (Create Budget)
class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "non_field_errors": [
                    "A budget for this category already exists for the selected month and year."
                ]
            })


# Handles GET (Detail), PUT/PATCH (Update Budget), and DELETE (Delete Budget)
class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # 1. Fetch the requested Budget belonging to the user
        budget = get_object_or_404(Budget, pk=pk, user=request.user)

        # 2. Filter expenses matching the budget's category, month, and year
        # (Fix: Changed 'expense_date' lookup to 'created_at')
        expenses_in_period = Expense.objects.filter(
            user=request.user,
            category=budget.category,
            created_at__month=budget.month,
            created_at__year=budget.year
        )

        # 3. Sum up matching expenses
        total_expense = expenses_in_period.aggregate(total=Sum('amount'))['total'] or 0.00
        total_expense = float(total_expense)
        budget_amount = float(budget.budget_amount)

        # 4. Calculate formulas
        remaining_budget = budget_amount - total_expense
        overspent_amount = 0.00

        if remaining_budget < 0:
            overspent_amount = abs(remaining_budget)
            remaining_budget = 0.00  # Cap remaining budget at 0 if overspent

        return Response({
            "category": budget.category,
            "month": budget.month,
            "year": budget.year,
            "budget_amount": budget_amount,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "overspent_amount": overspent_amount
        }, status=status.HTTP_200_OK)


class TransactionDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Total Income
        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0.00
        total_income = float(total_income)

        # 2. Total Expense
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0.00
        total_expense = float(total_expense)

        # 3. Current Balance
        current_balance = total_income - total_expense

        # 4. Total Budget Amount defined for this user
        total_budget = Budget.objects.filter(user=user).aggregate(total=Sum('budget_amount'))['total'] or 0.00
        total_budget = float(total_budget)

        # 5. Calculate global remaining budget (Total Budgets defined - Matching Month/Year Expenses)
        all_budgets = Budget.objects.filter(user=user)
        total_spent_against_budgets = 0.00

        for b in all_budgets:
            # Fix: Changed 'expense_date' to 'created_at'
            spent = Expense.objects.filter(
                user=user,
                category=b.category,
                created_at__month=b.month,
                created_at__year=b.year
            ).aggregate(total=Sum('amount'))['total'] or 0.00
            total_spent_against_budgets += float(spent)

        remaining_budget = total_budget - total_spent_against_budgets
        if remaining_budget < 0:
            remaining_budget = 0.00

        # 6. Recent Combined Transactions (Top 5)
        # Note: Assuming income uses 'income_date' and expense uses 'created_at'
        recent_incomes = Income.objects.filter(user=user).order_by('-income_date')[:5]
        recent_expenses = Expense.objects.filter(user=user).order_by('-created_at')[:5]

        combined_txs = []
        for i in recent_incomes:
            combined_txs.append({
                "type": "income",
                "title": i.title,
                "amount": float(i.amount),
                "date": str(i.income_date)
            })
        for e in recent_expenses:
            combined_txs.append({
                "type": "expense",
                "title": e.title,
                "amount": float(e.amount),
                "date": str(e.created_at.date())  # Convert DateTimeField to date string
            })

        # Sort combined list by date descending and slice top 5
        combined_txs = sorted(combined_txs, key=lambda x: x['date'], reverse=True)[:5]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "recent_transactions": combined_txs
        }, status=status.HTTP_200_OK)