from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BudgetAlertAPIView,
    BudgetSummaryAPIView,
    BudgetViewSet,
    SavingsGoalViewSet,
)

router = DefaultRouter()

router.register(
    "budgets",
    BudgetViewSet,
    basename="budget",
)

router.register(
    "savings-goals",
    SavingsGoalViewSet,
    basename="savings-goal",
)

urlpatterns = [
    path(
        "budget-summary/",
        BudgetSummaryAPIView.as_view(),
        name="budget-summary",
    ),

    path(
        "budget-alert/",
        BudgetAlertAPIView.as_view(),
        name="budget-alert",
    ),

    path(
        "",
        include(router.urls),
    ),
]