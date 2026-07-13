from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    API view to handle user registration.
    Validates user credentials via the serializer and generates simplejwt tokens upon success.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_status(request):
    """
    Minimal GET endpoint to return backend status.
    """
    return Response({"status": "running", "message": "BudgetBuddy API is operational."}, status=status.HTTP_200_OK)


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Expense, Income, Budget
from .serializers import ExpenseSerializer, IncomeSerializer, BudgetSerializer

# Expense CRUD Views
class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)
        
        # Category filtering
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category.upper())

        # Sorting
        sort = self.request.query_params.get('sort')
        if sort == 'latest':
            queryset = queryset.order_by('-expense_date', '-created_at', '-id')
        elif sort == 'oldest':
            queryset = queryset.order_by('expense_date', 'created_at', 'id')
        elif sort == 'highest':
            queryset = queryset.order_by('-amount')
        elif sort == 'lowest':
            queryset = queryset.order_by('amount')

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)


class TotalExpenseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        total = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0.00
        return Response({"total_expense": float(total)}, status=status.HTTP_200_OK)


# Income CRUD Views
class IncomeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)


# Budget CRUD Views
class BudgetListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


# Dashboard View
class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Calculations
        total_income_agg = Income.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_expense_agg = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))

        total_income = float(total_income_agg['total'] or 0.0)
        total_expense = float(total_expense_agg['total'] or 0.0)
        remaining_balance = total_income - total_expense

        income_count = Income.objects.filter(user=user).count()
        expense_count = Expense.objects.filter(user=user).count()

        # Fetch and format recent items
        recent_incomes = Income.objects.filter(user=user).order_by('-income_date', '-created_at')[:10]
        recent_expenses = Expense.objects.filter(user=user).order_by('-expense_date', '-created_at')[:10]

        serialized_incomes = [
            {
                "id": inc.id,
                "type": "income",
                "title": inc.source,
                "amount": float(inc.amount),
                "description": inc.description,
                "date": inc.income_date.isoformat(),
                "created_at": inc.created_at.isoformat()
            }
            for inc in recent_incomes
        ]

        serialized_expenses = [
            {
                "id": exp.id,
                "type": "expense",
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category,
                "description": exp.description,
                "date": exp.expense_date.isoformat(),
                "created_at": exp.created_at.isoformat()
            }
            for exp in recent_expenses
        ]

        # Combine and sort by date descending, then created_at descending
        recent_transactions = serialized_incomes + serialized_expenses
        recent_transactions.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)
        recent_transactions = recent_transactions[:10]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "remaining_balance": remaining_balance,
            "income_count": income_count,
            "expense_count": expense_count,
            "recent_transactions": recent_transactions
        }, status=status.HTTP_200_OK)

