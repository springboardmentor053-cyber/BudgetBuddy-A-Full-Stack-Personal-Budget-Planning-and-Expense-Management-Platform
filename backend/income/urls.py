from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FinancialSummaryView, IncomeViewSet

router = DefaultRouter()
router.register(r'incomes', IncomeViewSet, basename='income')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', FinancialSummaryView.as_view(), name='financial-summary'),
]
