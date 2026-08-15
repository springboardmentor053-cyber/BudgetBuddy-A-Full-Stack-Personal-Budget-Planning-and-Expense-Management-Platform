from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Sum

from .models import Income
from .serializers import IncomeSerializer

from expenses.models import Expense

from notifications.utils import create_notification


# =========================================================
# INCOME LIST + CREATE
# =========================================================

class IncomeListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = IncomeSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Income.objects.filter(
            user=self.request.user
        ).order_by(
            "-income_date",
            "-id"
        )

    def perform_create(self, serializer):

        income = serializer.save(
            user=self.request.user
        )

        create_notification(

            user=self.request.user,

            title="Income Added",

            message=(
                f"Income of ₹{income.amount} "
                f"has been added successfully."
            ),

            notification_type="SUCCESS"
        )


# =========================================================
# INCOME DETAIL
# =========================================================

class IncomeDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = IncomeSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Income.objects.filter(
            user=self.request.user
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    def perform_update(self, serializer):

        income = serializer.save()

        create_notification(

            user=self.request.user,

            title="Income Updated",

            message=(
                f"Income '{income.title}' "
                f"has been updated successfully."
            ),

            notification_type="INFO"
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    def perform_destroy(self, instance):

        title = instance.title
        amount = instance.amount

        user = instance.user

        instance.delete()

        create_notification(

            user=user,

            title="Income Deleted",

            message=(
                f"Income '{title}' "
                f"of ₹{amount} "
                f"has been deleted."
            ),

            notification_type="WARNING"
        )


# =========================================================
# FINANCIAL SUMMARY
# =========================================================

class FinancialSummaryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        balance = (
            total_income -
            total_expense
        )

        return Response({

            "total_income":
                total_income,

            "total_expense":
                total_expense,

            "current_balance":
                balance

        })