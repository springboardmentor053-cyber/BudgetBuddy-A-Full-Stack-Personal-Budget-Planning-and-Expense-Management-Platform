from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from budgets.views import BudgetViewSet
from users.views import ExpenseViewSet, IncomeViewSet
from notifications.views import NotificationViewSet

# DRF Router for ViewSets
router = DefaultRouter()
router.register(r'api/expenses/tracking', ExpenseViewSet, basename='expense')
router.register(r'api/incomes/management', IncomeViewSet, basename='income')
router.register(r'api/budgets', BudgetViewSet, basename='budget')
router.register(r'api/notifications', NotificationViewSet, basename='notification')  # <--- Added api/ prefix here!

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('income.urls')),
    path('', include(router.urls)),
    path('api/savings/', include('savings.urls')),  # Handles /api/savings/goals/
]