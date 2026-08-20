from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from budgets.views import BudgetViewSet
from notifications.views import NotificationViewSet
from users.ai_views import AIChatPortalView
from users.views import ExpenseViewSet, IncomeViewSet


def health_check(request):
    return JsonResponse({"status": "healthy", "message": "BudgetBuddy Backend is Running Successfully 🚀"})


# Core API Router for ViewSets
router = DefaultRouter()
router.register(r'expenses/tracking', ExpenseViewSet, basename='expense-tracking')
router.register(r'expenses', ExpenseViewSet, basename='expense-api')
router.register(r'incomes/management', IncomeViewSet, basename='income-management')
router.register(r'income', IncomeViewSet, basename='income-api')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Health Check
    path('', health_check, name='health-check'),
    path('admin/', admin.site.urls),

    # Authentication & User Management (Mapped to both /api/auth/ and /api/users/ for seamless compatibility)
    path('api/auth/', include('users.urls')),
    path('api/users/', include('users.urls')),

    # AI Chat & Analytics
    path('api/ai-chat/', AIChatPortalView.as_view(), name='ai-chat'),
    path('api/reports/', include('reports.urls')),
    path('api/savings/', include('savings.urls')),
    path('api/', include('income.urls')),

    # Router Viewsets (expenses, income, budgets, notifications)
    path('api/', include(router.urls)),
]