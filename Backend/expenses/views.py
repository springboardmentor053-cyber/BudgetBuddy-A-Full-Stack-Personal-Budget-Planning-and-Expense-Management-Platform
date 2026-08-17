from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from django.db.models import Sum

from .models import Expense
from .serializers import ExpenseSerializer

from budgets.models import Budget
from notifications.models import Notification
from notifications.email_service import send_notification_email


class ExpenseViewSet(viewsets.ModelViewSet):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    # =========================================================
    # GET EXPENSES
    # =========================================================

    def get_queryset(self):

        queryset = Expense.objects.filter(
            user=self.request.user
        )

        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(
                category=category
            )

        sort = self.request.query_params.get("sort")

        if sort == "latest":

            queryset = queryset.order_by("-date")

        elif sort == "oldest":

            queryset = queryset.order_by("date")

        elif sort == "highest":

            queryset = queryset.order_by("-amount")

        elif sort == "lowest":

            queryset = queryset.order_by("amount")

        else:

            queryset = queryset.order_by("-date")

        return queryset

    # =========================================================
    # CREATE EXPENSE - VALIDATION DEBUG
    # =========================================================

    def create(self, request, *args, **kwargs):

        print("====================================")
        print("📥 EXPENSE REQUEST DATA:")
        print(request.data)
        print("====================================")

        serializer = self.get_serializer(
            data=request.data
        )

        if not serializer.is_valid():

            print("❌ EXPENSE VALIDATION ERROR:")
            print(serializer.errors)
            print("====================================")

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    # =========================================================
    # BUDGET ALERT HELPER
    # =========================================================

    def check_budget_alert(self, expense):

        print("====================================")
        print(
            "EXPENSE CATEGORY:",
            expense.category
        )
        print(
            "EXPENSE DATE:",
            expense.date
        )
        print(
            "EXPENSE MONTH:",
            expense.date.strftime("%B")
        )
        print(
            "EXPENSE YEAR:",
            expense.date.year
        )
        print("====================================")

        # =====================================================
        # FIND MATCHING BUDGET
        # =====================================================

        budget = Budget.objects.filter(
            user=self.request.user,
            category=expense.category,
            month=expense.date.strftime("%B"),
            year=expense.date.year
        ).first()

        if not budget:

            print(
                "❌ NO MATCHING BUDGET FOUND"
            )

            return

        print(
            "✅ MATCHING BUDGET FOUND:",
            budget.id
        )

        # =====================================================
        # CALCULATE TOTAL EXPENSE
        # =====================================================

        total_expense = Expense.objects.filter(
            user=self.request.user,
            category=expense.category,
            date__month=expense.date.month,
            date__year=expense.date.year
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        # =====================================================
        # PREVENT DIVISION BY ZERO
        # =====================================================

        if budget.budget_amount <= 0:

            print(
                "❌ BUDGET AMOUNT IS ZERO OR NEGATIVE"
            )

            return

        # =====================================================
        # CALCULATE UTILIZATION
        # =====================================================

        utilization = (
            float(total_expense)
            / float(budget.budget_amount)
        ) * 100

        print("--------------------------------")
        print(
            "Budget Category :",
            budget.category
        )
        print(
            "Budget Amount   :",
            budget.budget_amount
        )
        print(
            "Total Expense   :",
            total_expense
        )
        print(
            "Utilization %   :",
            round(utilization, 2)
        )
        print("--------------------------------")

        # =====================================================
        # 100%+ — BUDGET EXCEEDED
        # =====================================================

        if utilization >= 100:

            title = "Budget Exceeded"

            message = (
                f"Your {budget.category} budget has been "
                f"exceeded for {budget.month} {budget.year}."
            )

            priority = "HIGH"

        # =====================================================
        # 90% — HIGH WARNING
        # =====================================================

        elif utilization >= 90:

            title = "High Warning"

            message = (
                f"You have used 90% of your monthly "
                f"{budget.category} budget for "
                f"{budget.month} {budget.year}."
            )

            priority = "HIGH"

        # =====================================================
        # 80% — WARNING
        # =====================================================

        elif utilization >= 80:

            title = "Warning"

            message = (
                f"You have used 80% of your monthly "
                f"{budget.category} budget for "
                f"{budget.month} {budget.year}."
            )

            priority = "MEDIUM"

        else:

            print(
                "ℹ️ Budget utilization is below 80%"
            )

            return

        # =====================================================
        # CHECK FOR DUPLICATE NOTIFICATION
        # =====================================================

        existing = Notification.objects.filter(
            user=self.request.user,
            title=title,
            notification_type="BUDGET",
            message=message
        ).exists()

        if existing:

            print(
                "ℹ️ Notification already exists:",
                title
            )

            return

        # =====================================================
        # CREATE NOTIFICATION
        # =====================================================

        notification = Notification.objects.create(
            user=self.request.user,
            title=title,
            message=message,
            notification_type="BUDGET",
            priority=priority
        )

        print(
            "🔔 NOTIFICATION CREATED:",
            notification.id
        )

        # =====================================================
        # EMAIL
        # =====================================================

        try:

            send_notification_email(
                notification
            )

            print(
                "📧 EMAIL NOTIFICATION PROCESSED"
            )

        except Exception as error:

            print(
                "❌ EMAIL ERROR:",
                error
            )

    # =========================================================
    # CREATE EXPENSE
    # =========================================================

    def perform_create(self, serializer):

        try:

            expense = serializer.save(
                user=self.request.user
            )

            print(
                "🔥 EXPENSE CREATED:",
                expense.id
            )

            self.check_budget_alert(
                expense
            )

            print(
                "✅ BUDGET CHECK COMPLETED"
            )

        except Exception as error:

            print(
                "❌ EXPENSE ERROR:",
                error
            )

            raise

    # =========================================================
    # UPDATE EXPENSE
    # =========================================================

    def perform_update(self, serializer):

        try:

            expense = serializer.save()

            print(
                "✏️ EXPENSE UPDATED:",
                expense.id
            )

            self.check_budget_alert(
                expense
            )

            print(
                "✅ BUDGET CHECK COMPLETED"
            )

        except Exception as error:

            print(
                "❌ EXPENSE UPDATE ERROR:",
                error
            )

            raise

    # =========================================================
    # TOTAL EXPENSE API
    # =========================================================

    @action(
        detail=False,
        methods=["get"]
    )
    def total(self, request):

        total = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response({
            "total_expense": total
        })