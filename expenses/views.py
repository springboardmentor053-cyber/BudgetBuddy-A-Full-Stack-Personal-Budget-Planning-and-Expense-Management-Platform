from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        # Category Filter
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # Sorting
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def total_expense(request):
    total = (
        Expense.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))["total"] or 0
    )

    return Response({
        "total_expense": total
    })