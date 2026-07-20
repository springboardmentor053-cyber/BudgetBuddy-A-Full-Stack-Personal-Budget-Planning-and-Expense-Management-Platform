from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    IncomeViewSet,
    financial_summary,
    transaction_dashboard,
)

router = DefaultRouter()
router.register(r"income", IncomeViewSet, basename="income")

urlpatterns = [
    path("summary/", financial_summary, name="financial-summary"),
    path("dashboard/", transaction_dashboard, name="transaction-dashboard"),
    path("", include(router.urls)),
]