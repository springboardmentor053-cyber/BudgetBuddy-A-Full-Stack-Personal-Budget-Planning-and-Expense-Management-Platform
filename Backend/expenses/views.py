from django.db.models import Sum
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Expense
from .serializers import ExpenseSerializer
from notifications_app.utils import send_notification


class ExpenseCreateView(APIView):  # Or whatever view class/function you are using
    def post(self, request):
        serializer = ExpenseSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            expense = serializer.save(user=request.user)

            # 🚀 Trigger notification & email here
            send_notification(
                user=request.user,
                title="Expense Logged",
                message=f"You successfully recorded an expense: {expense.title} for ₹{expense.amount}.",
                notification_type="EXPENSE",
                priority="MEDIUM",
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        category = self.request.query_params.get("category")
        if category and category != "All Categories":
            queryset = queryset.filter(category=category)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(title__icontains=search)

        sort = self.request.query_params.get("sort")
        if sort == "latest":
            queryset = queryset.order_by("-expense_date")
        elif sort == "oldest":
            queryset = queryset.order_by("expense_date")
        elif sort == "highest":
            queryset = queryset.order_by("-amount")
        elif sort == "lowest":
            queryset = queryset.order_by("amount")
        else:
            queryset = queryset.order_by("-expense_date")

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


class ExpenseCategorySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = (
            Expense.objects.filter(user=request.user)
            .values("category")
            .annotate(total_amount=Sum("amount"))
            .order_by("category")
        )
        return Response(summary)


class TotalExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Expense.objects.filter(user=request.user).aggregate(
            total=Sum("amount")
        )
        return Response({"total_expense": total["total"] or 0})


class ExpenseCategoryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            month = request.query_params.get("month")
            year = request.query_params.get("year")

            expenses = Expense.objects.filter(user=user)

            if month and year:
                expenses = expenses.filter(
                    expense_date__month=month, expense_date__year=year
                )

            category_summary = (
                expenses.values("category")
                .annotate(amount=Sum("amount"))
                .order_by("-amount")
            )

            data = [
                {
                    "category": item["category"] or "Uncategorized",
                    "amount": float(item["amount"] or 0),
                }
                for item in category_summary
            ]

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
