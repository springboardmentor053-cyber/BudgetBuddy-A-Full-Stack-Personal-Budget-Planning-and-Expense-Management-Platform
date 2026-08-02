from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavingsGoalViewSet

router = DefaultRouter()
router.register(r'goals', SavingsGoalViewSet, basename='savings-goal')

urlpatterns = [
    path('', include(router.urls)),
]