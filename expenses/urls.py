from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, total_expense

router = DefaultRouter()

router.register(r'expenses', ExpenseViewSet, basename='expenses')

urlpatterns = [
    path("expenses/total/", total_expense, name="total-expense"),
    path("", include(router.urls)),
]