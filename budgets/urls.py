from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    BudgetViewSet,
    budget_summary,
    budget_alert,
)

router = DefaultRouter()

router.register(
    r"budgets",
    BudgetViewSet,
    basename="budgets"
)

urlpatterns = [

    path(
        "budgets/summary/<str:category>/",
        budget_summary,
        name="budget-summary",
    ),

    path(
        "budgets/alert/<str:category>/",
        budget_alert,
        name="budget-alert",
    ),

    path("", include(router.urls)),
]