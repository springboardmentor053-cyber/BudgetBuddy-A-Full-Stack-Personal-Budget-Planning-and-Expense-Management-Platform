from rest_framework import generics
from .models import Income
from .serializers import IncomeSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from expenses.models import Expense
from rest_framework.permissions import IsAuthenticated



class IncomeListCreateView(generics.ListCreateAPIView):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]


class FinancialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_income = Income.objects.aggregate(
            Sum("amount")
        )["amount__sum"] or 0

        total_expense = Expense.objects.aggregate(
            Sum("amount")
        )["amount__sum"] or 0

        balance = total_income - total_expense

        data = {

            "Total Income": total_income,
            "Total Expense": total_expense,
            "Current Balance": balance,

        }

        return Response(data)
