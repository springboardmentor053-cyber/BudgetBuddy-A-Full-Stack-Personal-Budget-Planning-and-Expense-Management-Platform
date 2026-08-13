from copy import copy

from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import generics, permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView as SimpleJWTTokenRefreshView

from budgets.models import Budget
from notifications.budget_alerts import evaluate_expense_budget_alert
from notifications.utils import check_and_send_budget_alert
from .models import Expense, Income
from .serializers import ExpenseSerializer, IncomeSerializer, UserRegistrationSerializer, UserTokenObtainPairSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(TokenObtainPairView):
    serializer_class = UserTokenObtainPairSerializer

class TokenRefreshView(SimpleJWTTokenRefreshView):
    pass

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserRegistrationSerializer
    def get_object(self):
        return self.request.user
    def get(self, request, *args, **kwargs):
        return Response({'id': request.user.id, 'username': request.user.username,
            'email': request.user.email, 'role': request.user.role}, status=status.HTTP_200_OK)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user).order_by('-expense_date', '-created_at', '-id')
        category_filter = self.request.query_params.get('category')
        return queryset.filter(category__iexact=category_filter.strip()) if category_filter else queryset
    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        category_name = expense.category.strip()
        budget_limit = Budget.objects.filter(
            user=expense.user,
            category__iexact=category_name,
            month=expense.expense_date.month,
            year=expense.expense_date.year,
        ).aggregate(total=Sum('budget_amount'))['total']
        if budget_limit:
            total_spent = Expense.objects.filter(
                user=expense.user,
                category__iexact=category_name,
                expense_date__month=expense.expense_date.month,
                expense_date__year=expense.expense_date.year,
            ).aggregate(total=Sum('amount'))['total'] or 0
            check_and_send_budget_alert(
                expense.user,
                category_name,
                total_spent,
                budget_limit,
            )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        expense = serializer.instance
        response_data = {'message': 'Expense created successfully', 'expense': serializer.data}
        return Response(response_data, status=status.HTTP_201_CREATED, headers=self.get_success_headers(serializer.data))
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        previous_expense = copy(instance)
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        serializer.is_valid(raise_exception=True)
        expense = serializer.save()
        response_data = {'message': 'Expense updated successfully', 'expense': serializer.data}
        budget_alert = evaluate_expense_budget_alert(expense, previous_expense)
        if budget_alert:
            response_data['budget_alert'] = budget_alert
        return Response(response_data, status=status.HTTP_200_OK)

class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-date', '-id')
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
