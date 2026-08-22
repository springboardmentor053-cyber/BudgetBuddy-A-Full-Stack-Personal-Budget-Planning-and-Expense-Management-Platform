from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from .models import Expense
from .serializers import ExpenseSerializer
from budgets.models import Budget
from budgets.services import check_and_trigger_budget_alert

# Import the SendGrid email function you created in notifications/utils.py
from notifications.utils import send_budget_alert_email

# Reuse date parsing and transaction filtering helpers from reports
from reports.services import parse_date_filters, filter_transactions


# Helper function to recalculate budget utilization & trigger alerts
def sync_budget_alert(user, category, expense_date):
    if not category or not expense_date:
        return

    # Find the corresponding budget for category, month, and year
    budget = Budget.objects.filter(
        user=user,
        category=category,
        month=expense_date.month,
        year=expense_date.year
    ).first()

    if budget:
        # Sum total expenses matching user, category, month, and year
        total_expense = Expense.objects.filter(
            user=user,
            category=category,
            expense_date__month=budget.month,
            expense_date__year=budget.year
        ).aggregate(total=Sum('amount'))['total'] or 0.00

        # 1. Evaluate threshold logic and create Notification in DB
        check_and_trigger_budget_alert(budget, total_expense)

        # 2. If the user spent more than their budget limit, send SendGrid email!
        if total_expense > budget.budget_amount:
            send_budget_alert_email(
                user_email=user.email,
                username=user.username,
                category_name=category,
                current_spent=float(total_expense),
                budget_limit=float(budget.budget_amount)
            )


class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles Task 1 (View Expenses), Task 3 (Filter), and Task 4 (Sort)
    def get(self, request):
        # Start with only the logged-in user's expenses
        queryset = Expense.objects.filter(user=request.user)

        # Basic search by title
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        # Category filter
        category_filter = request.query_params.get('category', None)
        if category_filter:
            queryset = queryset.filter(category=category_filter.upper())

        # Date filters and range support
        filters = parse_date_filters(request)
        queryset = filter_transactions(queryset, 'expense_date', **filters)

        # Sorting
        sort_by = request.query_params.get('sort', None)
        if sort_by == 'latest':
            queryset = queryset.order_by('-expense_date')
        elif sort_by == 'oldest':
            queryset = queryset.order_by('expense_date')
        elif sort_by == 'highest':
            queryset = queryset.order_by('-amount')
        elif sort_by == 'lowest':
            queryset = queryset.order_by('amount')
        else:
            queryset = queryset.order_by('-expense_date') # Default to latest first

        serializer = ExpenseSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Handles Task 1 (Create Expense) + Triggers Budget Alert Check & SendGrid Email
    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            expense = serializer.save(user=request.user)

            # Recalculate budget utilization and check threshold, but never let
            # alert side effects fail the actual expense save.
            try:
                expense_date = getattr(expense, 'expense_date', None) or getattr(expense, 'created_at', None)
                sync_budget_alert(request.user, expense.category, expense_date)
            except Exception as exc:
                print(f"Expense alert sync failed for expense={expense.id}: {exc}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Handles Task 1 (Update Expense & Delete Expense) + Triggers Budget Alert Check
class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, user=request.user)
        old_category = expense.category
        old_date = getattr(expense, 'expense_date', None) or getattr(expense, 'created_at', None)

        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            updated_expense = serializer.save()

            try:
                # Recalculate budget for the updated category/date
                new_date = getattr(updated_expense, 'expense_date', None) or getattr(updated_expense, 'created_at', None)
                sync_budget_alert(request.user, updated_expense.category, new_date)

                # If category changed, recalculate the old category as well
                if old_category != updated_expense.category:
                    sync_budget_alert(request.user, old_category, old_date)
            except Exception as exc:
                print(f"Expense alert sync failed for expense={updated_expense.id}: {exc}")

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, user=request.user)
        old_category = expense.category
        old_date = getattr(expense, 'expense_date', None) or getattr(expense, 'created_at', None)

        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            updated_expense = serializer.save()

            new_date = getattr(updated_expense, 'expense_date', None) or getattr(updated_expense, 'created_at', None)
            sync_budget_alert(request.user, updated_expense.category, new_date)

            if old_category != updated_expense.category:
                sync_budget_alert(request.user, old_category, old_date)

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, user=request.user)
        category = expense.category
        expense_date = getattr(expense, 'expense_date', None) or getattr(expense, 'created_at', None)

        expense.delete()

        try:
            # Recalculate budget utilization after deletion
            sync_budget_alert(request.user, category, expense_date)
        except Exception as exc:
            print(f"Expense alert sync failed on delete for expense={pk}: {exc}")

        return Response(status=status.HTTP_204_NO_CONTENT)


# Handles Task 5 (Calculate Total Expenses)
class ExpenseTotalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Expense.objects.filter(user=request.user).aggregate(total_amount=Sum('amount'))['total_amount']
        return Response({"total_expenses": total or 0.00}, status=status.HTTP_200_OK)
