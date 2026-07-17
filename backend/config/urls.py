from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from users.views import ExpenseViewSet, IncomeViewSet

router = DefaultRouter()
router.register(r'api/expenses/tracking', ExpenseViewSet, basename='expense')
router.register(r'api/incomes/management', IncomeViewSet, basename='income')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('income.urls')),
    path('', include(router.urls)),
]