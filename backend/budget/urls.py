from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncomeViewSet, BudgetViewSet, SavingsGoalViewSet

router = DefaultRouter()
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'savings-goals', SavingsGoalViewSet, basename='savings-goal')

urlpatterns = [
    path('', include(router.urls)),
]