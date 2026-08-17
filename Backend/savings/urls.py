from django.urls import path

from .views import (
    SavingsGoalListCreateView,
    SavingsGoalDetailView,
    GoalProgressAPIView,
)


urlpatterns = [

    # ===========================================
    # Savings Goal CRUD APIs
    # ===========================================

    path(
        '',
        SavingsGoalListCreateView.as_view(),
        name='savings-goal-list-create'
    ),

    path(
        '<int:pk>/',
        SavingsGoalDetailView.as_view(),
        name='savings-goal-detail'
    ),

    # ===========================================
    # Goal Progress API
    # ===========================================

    path(
        '<int:pk>/progress/',
        GoalProgressAPIView.as_view(),
        name='goal-progress'
    ),

]