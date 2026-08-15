from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Sum

from .models import Expense
from .serializers import ExpenseSerializer

from budgets.models import Budget

from notifications.models import Notification
from notifications.utils import create_notification


# =========================================================
# BUDGET ALERT FUNCTION
# =========================================================

def check_budget_alert(expense):

    user = expense.user

    # -----------------------------------------------------
    # FIND MATCHING BUDGET
    # -----------------------------------------------------

    month_name = expense.expense_date.strftime("%B")
    year = expense.expense_date.year
    month_number = expense.expense_date.month

    budget = Budget.objects.filter(
        user=user,
        category=expense.category,
        month=month_name,
        year=year
    ).first()

    if not budget:
        return

    # -----------------------------------------------------
    # TOTAL EXPENSE FOR THIS CATEGORY + MONTH
    # -----------------------------------------------------

    total_expense = Expense.objects.filter(
        user=user,
        category=budget.category,
        expense_date__year=budget.year,
        expense_date__month=month_number
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    budget_amount = budget.budget_amount

    # -----------------------------------------------------
    # PREVENT DIVISION BY ZERO
    # -----------------------------------------------------

    if budget_amount <= 0:
        return

    # -----------------------------------------------------
    # CALCULATE UTILIZATION
    # -----------------------------------------------------

    percentage_used = (
        total_expense / budget_amount
    ) * 100

    # =====================================================
    # 100% OR MORE
    # =====================================================

    if percentage_used >= 100:

        title = "Budget Exceeded"

        notification_type = "ALERT"

        message = (
            f"Your {budget.category} budget for "
            f"{budget.month} has been exceeded. "
            f"You have spent ₹{total_expense} "
            f"against a budget of ₹{budget_amount}."
        )

    # =====================================================
    # 90% OR MORE
    # =====================================================

    elif percentage_used >= 90:

        title = "High Budget Warning"

        notification_type = "WARNING"

        message = (
            f"You have used "
            f"{percentage_used:.0f}% of your "
            f"{budget.category} budget for "
            f"{budget.month}. "
            f"You have spent ₹{total_expense} "
            f"out of ₹{budget_amount}."
        )

    # =====================================================
    # 80% OR MORE
    # =====================================================

    elif percentage_used >= 80:

        title = "Budget Warning"

        notification_type = "WARNING"

        message = (
            f"You have used "
            f"{percentage_used:.0f}% of your "
            f"{budget.category} budget for "
            f"{budget.month}. "
            f"You have spent ₹{total_expense} "
            f"out of ₹{budget_amount}."
        )

    else:

        return

    # -----------------------------------------------------
    # PREVENT DUPLICATE ALERTS
    # -----------------------------------------------------

    already_notified = Notification.objects.filter(
        user=user,
        title=title
    ).filter(
        message__icontains=budget.category
    ).filter(
        message__icontains=budget.month
    ).exists()

    if already_notified:
        return

    # -----------------------------------------------------
    # CREATE NOTIFICATION
    # -----------------------------------------------------

    create_notification(

        user=user,

        title=title,

        message=message,

        notification_type=notification_type
    )


# =========================================================
# EXPENSE LIST + CREATE
# =========================================================

class ExpenseListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = ExpenseSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Expense.objects.filter(
            user=self.request.user
        ).order_by(
            "-expense_date",
            "-id"
        )

    def perform_create(self, serializer):

        # -------------------------------------------------
        # CREATE EXPENSE
        # -------------------------------------------------

        expense = serializer.save(
            user=self.request.user
        )

        # -------------------------------------------------
        # NORMAL EXPENSE NOTIFICATION
        # -------------------------------------------------

        create_notification(

            user=self.request.user,

            title="Expense Added",

            message=(
                f"Expense '{expense.title}' "
                f"of ₹{expense.amount} "
                f"has been added successfully."
            ),

            notification_type="SUCCESS"
        )

        # -------------------------------------------------
        # CHECK BUDGET ALERT
        # -------------------------------------------------

        check_budget_alert(
            expense
        )


# =========================================================
# EXPENSE DETAIL
# =========================================================

class ExpenseDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ExpenseSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Expense.objects.filter(
            user=self.request.user
        )

    # =====================================================
    # UPDATE EXPENSE
    # =====================================================

    def perform_update(self, serializer):

        expense = serializer.save()

        # -------------------------------------------------
        # UPDATE NOTIFICATION
        # -------------------------------------------------

        create_notification(

            user=self.request.user,

            title="Expense Updated",

            message=(
                f"Expense '{expense.title}' "
                f"has been updated successfully."
            ),

            notification_type="INFO"
        )

        # -------------------------------------------------
        # CHECK BUDGET AGAIN
        # -------------------------------------------------

        check_budget_alert(
            expense
        )

    # =====================================================
    # DELETE EXPENSE
    # =====================================================

    def perform_destroy(self, instance):

        title = instance.title

        amount = instance.amount

        user = instance.user

        # -------------------------------------------------
        # DELETE
        # -------------------------------------------------

        instance.delete()

        # -------------------------------------------------
        # DELETE NOTIFICATION
        # -------------------------------------------------

        create_notification(

            user=user,

            title="Expense Deleted",

            message=(
                f"Expense '{title}' "
                f"of ₹{amount} "
                f"has been deleted."
            ),

            notification_type="WARNING"
        )


# =========================================================
# EXPENSE CATEGORY FILTER
# =========================================================

class ExpenseCategoryFilterView(
    generics.ListAPIView
):

    serializer_class = ExpenseSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        category = self.kwargs["category"]

        return Expense.objects.filter(
            user=self.request.user,
            category=category
        ).order_by(
            "-expense_date",
            "-id"
        )


# =========================================================
# EXPENSE SORT
# =========================================================

class ExpenseSortView(
    generics.ListAPIView
):

    serializer_class = ExpenseSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        sort_by = self.request.query_params.get(
            "sort"
        )

        queryset = Expense.objects.filter(
            user=self.request.user
        )

        if sort_by == "latest":

            return queryset.order_by(
                "-expense_date",
                "-id"
            )

        elif sort_by == "oldest":

            return queryset.order_by(
                "expense_date",
                "id"
            )

        elif sort_by == "highest":

            return queryset.order_by(
                "-amount"
            )

        elif sort_by == "lowest":

            return queryset.order_by(
                "amount"
            )

        return queryset.order_by(
            "-expense_date",
            "-id"
        )


# =========================================================
# TOTAL EXPENSE
# =========================================================

class TotalExpenseView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        total = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response({

            "total_expenses": total

        })