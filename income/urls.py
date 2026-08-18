from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    IncomeViewSet,
    financial_summary,
    transaction_dashboard,
)

router = DefaultRouter()

router.register(
    r"income",
    IncomeViewSet,
    basename="income",
)

urlpatterns = [

    # Financial Summary API
    path(
        "summary/",
        financial_summary,
        name="financial-summary",
    ),

    # Income Dashboard API
    path(
        "income-dashboard/",
        transaction_dashboard,
        name="transaction-dashboard",
    ),

    # Income CRUD APIs
    path(
        "",
        include(router.urls),
    ),
]