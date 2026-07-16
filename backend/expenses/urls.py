from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ExpenseViewSet, IncomeViewSet, dashboard_summary

router = DefaultRouter()
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"incomes", IncomeViewSet, basename="income")

urlpatterns = router.urls + [
    path("dashboard/", dashboard_summary, name="dashboard-summary"),
]