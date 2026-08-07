from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Income
from .serializers import IncomeSerializer

# Import your existing Expense model from your expenses app
from expenses.models import Expense 
from reports.services import parse_date_filters, filter_transactions

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Fetches transaction elements sorted by date
        qs = Income.objects.filter(user=self.request.user)

        # Apply simple query params: search, source, date filters, sort
        params = self.request.query_params
        search = params.get('search')
        source = params.get('source')
        sort_by = params.get('sort')

        if search:
            qs = qs.filter(title__icontains=search)
        if source:
            qs = qs.filter(source=source.upper())

        # Date filters
        filters = parse_date_filters(self.request)
        qs = filter_transactions(qs, 'income_date', **filters)

        # Sorting
        if sort_by == 'latest':
            qs = qs.order_by('-income_date')
        elif sort_by == 'oldest':
            qs = qs.order_by('income_date')
        elif sort_by == 'highest':
            qs = qs.order_by('-amount')
        elif sort_by == 'lowest':
            qs = qs.order_by('amount')
        else:
            qs = qs.order_by('-income_date')

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Aggregate total calculations safely
        total_income_query = Income.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_expense_query = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))

        total_income = float(total_income_query['total'] or 0.0)
        total_expense = float(total_expense_query['total'] or 0.0)
        current_balance = total_income - total_expense

        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'current_balance': current_balance
        })