import threading

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Sum
from rest_framework import generics, permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView as SimpleJWTTokenRefreshView

from budgets.models import Budget
from notifications.utils import check_and_send_budget_alert
from .models import Expense, Income
from .serializers import ExpenseSerializer, IncomeSerializer, UserRegistrationSerializer, UserTokenObtainPairSerializer

User = get_user_model()


def send_welcome_email(user):
    """Sends a welcome email asynchronously to the registered user's email address."""
    if not user.email:
        return

    def _send():
        try:
            subject = "Welcome to BudgetBuddy!"
            message = (
                f"Hi {user.username},\n\n"
                f"Welcome to BudgetBuddy! Your account has been created successfully.\n\n"
                f"You can now manage your income, track expenses, set budget caps, and monitor savings goals.\n\n"
                f"Best regards,\n"
                f"BudgetBuddy Team"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print(f"[EMAIL] Welcome email successfully sent to {user.email}")
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send welcome email to {user.email}: {str(e)}")

    threading.Thread(target=_send).start()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_welcome_email(user)


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
        return Response(
            {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'role': getattr(request.user, 'role', 'user'),
            },
            status=status.HTTP_200_OK,
        )


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
        return self._check_budget_alert(expense)

    def perform_update(self, serializer):
        expense = serializer.save()
        return self._check_budget_alert(expense)

    @staticmethod
    def _check_budget_alert(expense):
        category_name = expense.category.strip()
        budget = Budget.objects.filter(
            user=expense.user,
            category__iexact=category_name,
            month=expense.expense_date.month,
            year=expense.expense_date.year,
        ).first()

        if budget and budget.budget_amount > 0:
            total_spent = Expense.objects.filter(
                user=expense.user,
                category__iexact=category_name,
                expense_date__month=expense.expense_date.month,
                expense_date__year=expense.expense_date.year,
            ).aggregate(total=Sum('amount'))['total'] or 0

            percentage = (float(total_spent) / float(budget.budget_amount)) * 100
            notification = check_and_send_budget_alert(
                expense.user,
                category_name,
                total_spent,
                budget.budget_amount,
            )

            if notification and percentage >= 80:
                level = (
                    'exceeded_100' if percentage >= 100 else
                    'critical_90' if percentage >= 90 else
                    'warning_80'
                )
                return {
                    'category': category_name,
                    'percentage': round(percentage, 1),
                    'spent': float(total_spent),
                    'limit': float(budget.budget_amount),
                    'message': notification.message,
                    'level': level,
                    'triggered': True,
                }
        return None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        budget_alert = self.perform_create(serializer)
        response_data = {'message': 'Expense created successfully', 'expense': serializer.data}
        if budget_alert:
            response_data['budget_alert'] = budget_alert
        return Response(response_data, status=status.HTTP_201_CREATED, headers=self.get_success_headers(serializer.data))

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        serializer.is_valid(raise_exception=True)
        budget_alert = self.perform_update(serializer)
        response_data = {'message': 'Expense updated successfully', 'expense': serializer.data}
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
