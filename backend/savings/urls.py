from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavingsGoalViewSet, GoalProgressView

router = DefaultRouter()
router.register(r'', SavingsGoalViewSet, basename='savingsgoal')

urlpatterns = [
    path('<int:pk>/progress/', GoalProgressView.as_view(), name='goal-progress'),
    path('', include(router.urls)),
]