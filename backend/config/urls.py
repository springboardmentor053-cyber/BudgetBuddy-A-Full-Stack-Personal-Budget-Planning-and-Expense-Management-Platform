from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from budgets.views import BudgetViewSet
from users.views import ExpenseViewSet, IncomeViewSet
from notifications.views import NotificationViewSet
from users.ai_views import AIChatPortalView

def health_check(request):
    return JsonResponse({"status": "healthy", "message": "BudgetBuddy Backend is Running Successfully 🚀"})

# 1. Register router without 'api/' inside the strings
router = DefaultRouter()
router.register(r'expenses/tracking', ExpenseViewSet, basename='expense')
router.register(r'expenses', ExpenseViewSet, basename='expense-api')
router.register(r'incomes/management', IncomeViewSet, basename='income')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/ai-chat/', AIChatPortalView.as_view(), name='ai-chat'),
    path('api/', include('income.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/savings/', include('savings.urls')),

    # 2. Namespace the router under 'api/' so it stops hijacking '/'
    path('api/', include(router.urls)),

    # 3. Add your home / dashboard template view here (if Django serves it)
    # path('', HomeView.as_view(), name='home'),
]