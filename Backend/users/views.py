from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Profile
from .serializers import ProfileSerializer, UserRegistrationSerializer

# Import your other models (adjust app names if they differ in your project)
from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        user = request.user

        # Calculate totals dynamically
        total_income_count = Income.objects.filter(user=user).count()
        total_expense_count = Expense.objects.filter(user=user).count()

        response.data['total_transactions'] = total_income_count + \
            total_expense_count
        response.data['budgets_count'] = Budget.objects.filter(
            user=user).count()
        response.data['savings_goals_count'] = SavingsGoal.objects.filter(
            user=user).count()

        return response

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        profile = queryset.first()
        if profile:
            serializer = self.get_serializer(profile)
            data = dict(serializer.data)
            user = request.user

            total_income_count = Income.objects.filter(user=user).count()
            total_expense_count = Expense.objects.filter(user=user).count()

            data['total_transactions'] = total_income_count + total_expense_count
            data['budgets_count'] = Budget.objects.filter(user=user).count()
            data['savings_goals_count'] = SavingsGoal.objects.filter(
                user=user).count()
            return Response([data])
        return Response([])


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserSettingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "currency": getattr(user, 'currency', 'USD'),
            "theme": getattr(user, 'theme', 'dark'),
            "notifications_enabled": True,
        })
