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
        expense = serializer.save(user=self.request.user)
        from budgets.models import Budget
        from reports.models import Notification
        from django.db.models import Sum
        import datetime

        # Get budget for this category for the current month
        current_date = expense.date or datetime.date.today()
        # Ensure month matches title-case standard like "July"
        month_str = current_date.strftime("%B")
        
        budget = Budget.objects.filter(user=self.request.user, category=expense.category, month=month_str).first()
        if budget:
            start_of_month = datetime.date(current_date.year, current_date.month, 1)
            if current_date.month == 12:
                end_of_month = datetime.date(current_date.year + 1, 1, 1)
            else:
                end_of_month = datetime.date(current_date.year, current_date.month + 1, 1)
            
            total_spent = Expense.objects.filter(
                user=self.request.user,
                category=expense.category,
                date__gte=start_of_month,
                date__lt=end_of_month
            ).aggregate(total=Sum('amount'))['total'] or 0

            if total_spent > budget.limit_amount:
                Notification.objects.create(
                    user=self.request.user,
                    message=f"Budget limit exceeded! You have spent ${total_spent:.2f} of your ${budget.limit_amount:.2f} limit on {expense.category} in {month_str}."
                )


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