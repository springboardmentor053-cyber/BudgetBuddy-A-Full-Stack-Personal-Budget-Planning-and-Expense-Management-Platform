from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)
        
        # Filter by Category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category.upper())
            
        # Sort Expenses
        sort = self.request.query_params.get('sort')
        if sort == 'latest':
            queryset = queryset.order_by('-date', '-id')
        elif sort == 'oldest':
            queryset = queryset.order_by('date', 'id')
        elif sort == 'highest':
            queryset = queryset.order_by('-amount')
        elif sort == 'lowest':
            queryset = queryset.order_by('amount')
        else:
            queryset = queryset.order_by('-date', '-id')
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


class ExpenseTotalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum
        queryset = Expense.objects.filter(user=request.user)
        
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category.upper())
            
        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        return Response({'total_expenses': float(total)}, status=200)