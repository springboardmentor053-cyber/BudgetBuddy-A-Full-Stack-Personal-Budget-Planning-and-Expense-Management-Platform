from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BudgetViewSet, budget_summary

router = DefaultRouter()
router.register(r"budgets", BudgetViewSet, basename="budgets")

urlpatterns = [
    path(
        "budgets/summary/<str:category>/",
        budget_summary,
        name="budget-summary",
    ),

    path("", include(router.urls)),
]