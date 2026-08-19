from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, BudgetSummaryView,BudgetAlertView

router = DefaultRouter()
router.register(r'', BudgetViewSet, basename='budget')

urlpatterns = [
    path('summary/', BudgetSummaryView.as_view(), name='budget-summary'),
    path('', include(router.urls)),
    path('alerts/',BudgetAlertView.as_view(),name='budget-alerts'),
]