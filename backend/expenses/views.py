from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles Task 1 (View Expenses), Task 3 (Filter), and Task 4 (Sort)
    def get(self, request):
        # Start with only the logged-in user's expenses
        queryset = Expense.objects.filter(user=request.user)

        # Task 3: Filter Expenses by Category
        category_filter = request.query_params.get('category', None)
        if category_filter:
            queryset = queryset.filter(category=category_filter.upper())

        # Task 4: Sort Expenses
        sort_by = request.query_params.get('sort', None)
        if sort_by == 'latest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'highest':
            queryset = queryset.order_by('-amount')
        elif sort_by == 'lowest':
            queryset = queryset.order_by('amount')
        else:
            queryset = queryset.order_by('-created_at') # Default to latest first

        serializer = ExpenseSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Handles Task 1 (Create Expense)
    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically save the expense to the current logged-in user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Handles Task 1 (Update Expense & Delete Expense)
class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, user=request.user)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, user=request.user)
        expense.delete()
        # Return a completely empty response body to respect the 204 HTTP specification
        return Response(status=status.HTTP_204_NO_CONTENT)


# Handles Task 5 (Calculate Total Expenses)
class ExpenseTotalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Expense.objects.filter(user=request.user).aggregate(total_amount=Sum('amount'))['total_amount']
        return Response({"total_expenses": total or 0.00}, status=status.HTTP_200_OK)