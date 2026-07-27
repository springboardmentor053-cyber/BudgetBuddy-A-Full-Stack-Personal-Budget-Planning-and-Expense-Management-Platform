from django.db.models import Sum
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        # Filter by category
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(category=category)

        # Sort expenses
        sort = self.request.query_params.get("sort")

        if sort == "latest":
            queryset = queryset.order_by("-expense_date")

        elif sort == "oldest":
            queryset = queryset.order_by("expense_date")

        elif sort == "highest":
            queryset = queryset.order_by("-amount")

        elif sort == "lowest":
            queryset = queryset.order_by("amount")

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


class TotalExpenseView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        return Response({
            "total_expense": total_expense
        })