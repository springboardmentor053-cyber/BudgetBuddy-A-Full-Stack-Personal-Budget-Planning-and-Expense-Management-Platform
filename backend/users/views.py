from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import generics, permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView as SimpleJWTTokenRefreshView

from .models import Expense, Income
from budgets.models import Budget
from .serializers import (
    ExpenseSerializer,
    IncomeSerializer,
    UserRegistrationSerializer,
    UserTokenObtainPairSerializer,
)

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
        serializer = self.get_serializer(request.user)
        return Response(
            {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'role': request.user.role,
            },
            status=status.HTTP_200_OK,
        )


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user).order_by('-expense_date')
        category_filter = self.request.query_params.get('category', None)
        if category_filter is not None:
            queryset = queryset.filter(category=category_filter.upper())
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        expense = serializer.instance
        budget_amount = Budget.objects.filter(
            user=request.user,
            category__iexact=expense.category,
            month=expense.expense_date.month,
            year=expense.expense_date.year,
        ).aggregate(total=Sum('budget_amount'))['total']

        response_data = serializer.data
        if budget_amount is not None:
            total_expense = Expense.objects.filter(
                user=request.user,
                category__iexact=expense.category,
                expense_date__month=expense.expense_date.month,
                expense_date__year=expense.expense_date.year,
            ).aggregate(total=Sum('amount'))['total'] or 0
            overspent_amount = max(0.0, float(total_expense) - float(budget_amount))

            if overspent_amount > 0:
                response_data['overbudget_alert'] = True
                response_data['alert'] = (
                    f'Overbudget Warning: You have exceeded your {expense.category} '
                    f'budget by ₹{overspent_amount:.2f}!'
                )
            else:
                response_data['overbudget_alert'] = False

        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
