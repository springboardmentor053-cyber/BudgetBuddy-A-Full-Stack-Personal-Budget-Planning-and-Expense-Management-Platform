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

        # Calculations using Sum aggregate
        total_income_agg = Income.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_expense_agg = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))
        total_budget_agg = Budget.objects.filter(user=user).aggregate(total=Sum('budget_amount'))

        total_income = float(total_income_agg['total'] or 0.0)
        total_expense = float(total_expense_agg['total'] or 0.0)
        total_budget = float(total_budget_agg['total'] or 0.0)

        current_balance = total_income - total_expense
        remaining_budget = total_budget - total_expense

        income_count = Income.objects.filter(user=user).count()
        expense_count = Expense.objects.filter(user=user).count()

        # Fetch and format recent items (fetch up to 5 of each, then merge and sort)
        recent_incomes = Income.objects.filter(user=user).order_by('-income_date', '-created_at')[:5]
        recent_expenses = Expense.objects.filter(user=user).order_by('-expense_date', '-created_at')[:5]

        serialized_incomes = [
            {
                "id": inc.id,
                "type": "Income",
                "category": None,
                "amount": float(inc.amount),
                "date": inc.income_date.isoformat(),
                "description": inc.description,
                "title": inc.source,  # Maintain title for UI display
                "created_at": inc.created_at.isoformat()
            }
            for inc in recent_incomes
        ]

        serialized_expenses = [
            {
                "id": exp.id,
                "type": "Expense",
                "category": exp.category,
                "amount": float(exp.amount),
                "date": exp.expense_date.isoformat(),
                "description": exp.description,
                "title": exp.title,  # Maintain title for UI display
                "created_at": exp.created_at.isoformat()
            }
            for exp in recent_expenses
        ]

        # Combine and sort by date descending, then created_at descending
        recent_transactions = serialized_incomes + serialized_expenses
        recent_transactions.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)
        recent_transactions = recent_transactions[:5]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "remaining_balance": current_balance,  # Backward compatibility for UI
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "income_count": income_count,
            "expense_count": expense_count,
            "recent_transactions": recent_transactions
        }, status=status.HTTP_200_OK)


