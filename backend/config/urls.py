from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import RegisterView, LogoutView, ProtectedView
from expenses.views import ExpenseViewSet, IncomeViewSet as OldIncomeViewSet, TotalExpensesView
from budgets.views import BudgetViewSet, SavingsGoalViewSet as OldSavingsGoalViewSet, BudgetSummaryView
from income.views import IncomeViewSet, FinancialSummaryView
from savings.views import SavingsGoalViewSet, SavingsGoalProgressView
from notifications.views import NotificationViewSet, MarkNotificationReadView

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'income', IncomeViewSet, basename='income')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'savings-goals', SavingsGoalViewSet, basename='savingsgoal')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/protected/', ProtectedView.as_view(), name='protected'),
    path('api/expenses/total/', TotalExpensesView.as_view(), name='total-expenses'),
    path('api/summary/', FinancialSummaryView.as_view(), name='financial-summary'),
    path('api/budgets/summary/', BudgetSummaryView.as_view(), name='budget-summary'),
    path('api/savings-goals/progress/', SavingsGoalProgressView.as_view(), name='savings-progress'),
    path('api/notifications/<int:pk>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('api/', include(router.urls)),
]