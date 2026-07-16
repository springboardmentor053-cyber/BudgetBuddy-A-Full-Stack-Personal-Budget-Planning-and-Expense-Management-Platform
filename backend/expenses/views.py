from django.db.models import Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Expense, Income
from .serializers import ExpenseSerializer, IncomeSerializer
from .models import Expense
from .serializers import ExpenseSerializer
from rest_framework.decorators import action, api_view, permission_classes

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        sort = self.request.query_params.get("sort")

        if sort == "latest":
            queryset = queryset.order_by("-date")
        elif sort == "oldest":
            queryset = queryset.order_by("date")
        elif sort == "highest":
            queryset = queryset.order_by("-amount")
        elif sort == "lowest":
            queryset = queryset.order_by("amount")

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def total(self, request):
        total_expense = self.get_queryset().aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response(
            {"total_expense": total_expense},
            status=status.HTTP_200_OK,
        )
class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by("-date")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def total(self, request):
        total_income = self.get_queryset().aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response(
            {"total_income": total_income},
            status=status.HTTP_200_OK,
        )
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    expenses = Expense.objects.filter(user=request.user)
    incomes = Income.objects.filter(user=request.user)

    total_expense = expenses.aggregate(
        total=Sum("amount")
    )["total"] or 0

    total_income = incomes.aggregate(
        total=Sum("amount")
    )["total"] or 0

    balance = total_income - total_expense

    recent_expenses = ExpenseSerializer(
        expenses.order_by("-date")[:5],
        many=True
    ).data

    recent_incomes = IncomeSerializer(
        incomes.order_by("-date")[:5],
        many=True
    ).data

    return Response({
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "recent_expenses": recent_expenses,
        "recent_incomes": recent_incomes,
    })