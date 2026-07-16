from rest_framework import generics
from .models import Expense
from .serializers import ExpenseSerializer
from rest_framework.views import APIView
from rest_framework.response import Response


# Add Expense & Get All Expenses
class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


# Update & Delete Expense
class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer 
    

class ExpenseCategoryFilterView(generics.ListAPIView):

    serializer_class = ExpenseSerializer

    def get_queryset(self):
        category = self.kwargs['category']
        return Expense.objects.filter(category=category)


class ExpenseSortView(generics.ListAPIView):

    serializer_class = ExpenseSerializer

    def get_queryset(self):

        sort_by = self.request.query_params.get("sort")

        if sort_by == "latest":
            return Expense.objects.all().order_by("-expense_date")

        elif sort_by == "oldest":
            return Expense.objects.all().order_by("expense_date")

        elif sort_by == "highest":
            return Expense.objects.all().order_by("-amount")

        elif sort_by == "lowest":
            return Expense.objects.all().order_by("amount")

        return Expense.objects.all()


class TotalExpenseView(APIView):

    def get(self, request):

        total = sum(
            expense.amount
            for expense in Expense.objects.all()
        )

        return Response({
            "Total Expenses": total
        })
