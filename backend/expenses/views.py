from django.db.models import Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.utils import check_budget_alert

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Expense.objects.none()

        queryset = Expense.objects.filter(
            user=self.request.user
        )

        category = self.request.query_params.get(
            "category"
        )

        if category:
            queryset = queryset.filter(
                category=category
            )

        sort = self.request.query_params.get(
            "sort"
        )

        if sort == "latest":
            queryset = queryset.order_by(
                "-date",
                "-id",
            )

        elif sort == "oldest":
            queryset = queryset.order_by(
                "date",
                "id",
            )

        elif sort == "highest":
            queryset = queryset.order_by(
                "-amount",
                "-id",
            )

        elif sort == "lowest":
            queryset = queryset.order_by(
                "amount",
                "id",
            )

        else:
            queryset = queryset.order_by(
                "-date",
                "-id",
            )

        return queryset

    def perform_create(self, serializer):

        expense = serializer.save(
            user=self.request.user
        )

        check_budget_alert(
            user=expense.user,
            category=expense.category,
            expense_date=expense.date,
        )

    def perform_update(self, serializer):

        old_expense = self.get_object()

        old_category = old_expense.category
        old_date = old_expense.date

        expense = serializer.save()

        check_budget_alert(
            user=expense.user,
            category=expense.category,
            expense_date=expense.date,
        )

        if (
            old_category != expense.category
            or old_date.month != expense.date.month
            or old_date.year != expense.date.year
        ):
            check_budget_alert(
                user=expense.user,
                category=old_category,
                expense_date=old_date,
            )

    def perform_destroy(self, instance):

        user = instance.user
        category = instance.category
        expense_date = instance.date

        instance.delete()

        check_budget_alert(
            user=user,
            category=category,
            expense_date=expense_date,
        )

    @action(
        detail=False,
        methods=["get"],
    )
    def total(self, request):

        total_expense = (
            self.get_queryset()
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        return Response(
            {
                "total_expense": total_expense
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
    )
    def insights(self, request):

        queryset = self.get_queryset()

        highest = (
            queryset
            .order_by("-amount", "-id")
            .first()
        )

        lowest = (
            queryset
            .order_by("amount", "id")
            .first()
        )

        latest = (
            queryset
            .order_by("-date", "-id")
            .first()
        )

        oldest = (
            queryset
            .order_by("date", "id")
            .first()
        )

        def expense_data(expense):

            if not expense:
                return None

            return {
                "id": expense.id,
                "title": expense.title,
                "amount": expense.amount,
                "category": expense.category,
                "date": expense.date,
            }

        return Response(
            {
                "highest_expense":
                    expense_data(highest),

                "lowest_expense":
                    expense_data(lowest),

                "latest_expense":
                    expense_data(latest),

                "oldest_expense":
                    expense_data(oldest),
            },
            status=status.HTTP_200_OK,
        )