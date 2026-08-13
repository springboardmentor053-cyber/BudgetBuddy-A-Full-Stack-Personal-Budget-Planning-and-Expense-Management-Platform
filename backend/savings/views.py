from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer


class SavingsGoalViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Savings Goals protected by JWT Authentication.
    - CREATE: POST /api/savings/goals/
    - LIST: GET /api/savings/goals/
    - RETRIEVE: GET /api/savings/goals/{id}/
    - UPDATE: PUT/PATCH /api/savings/goals/{id}/
    - DELETE: DELETE /api/savings/goals/{id}/
    - PROGRESS SUMMARY: GET /api/savings/goals/progress/
    - SINGLE GOAL PROGRESS: GET /api/savings/goals/{id}/progress/
    """
    serializer_class = SavingsGoalSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Strict user isolation: return goals belonging only to the logged-in JWT user
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Auto-associate the savings goal with the current user
        serializer.save(user=self.request.user)

    # 🎯 TASK 5: Overall Goal Progress API (GET /api/savings/goals/progress/)
    @action(detail=False, methods=['get'], url_path='progress')
    def overall_progress(self, request):
        goals = self.get_queryset()
        progress_data = []

        for goal in goals:
            target = float(goal.target_amount)
            saved = float(goal.saved_amount)
            remaining = max(0.0, target - saved)
            percentage = round((saved / target) * 100, 2) if target > 0 else 0.0

            progress_data.append({
                "id": goal.id,
                "title": goal.title,
                "target_amount": str(goal.target_amount),
                "saved_amount": str(goal.saved_amount),
                "remaining_amount": remaining,
                "progress_percentage": min(100.0, percentage),
                "status": goal.status,
                "target_date": goal.target_date,
            })

        return Response({
            "total_goals": len(progress_data),
            "goals": progress_data
        }, status=status.HTTP_200_OK)

    # 🎯 TASK 5: Single Goal Progress API (GET /api/savings/goals/{id}/progress/)
    @action(detail=True, methods=['get'], url_path='progress')
    def goal_progress(self, request, pk=None):
        goal = self.get_object()
        target = float(goal.target_amount)
        saved = float(goal.saved_amount)
        remaining = max(0.0, target - saved)
        percentage = round((saved / target) * 100, 2) if target > 0 else 0.0

        return Response({
            "id": goal.id,
            "title": goal.title,
            "target_amount": str(goal.target_amount),
            "saved_amount": str(goal.saved_amount),
            "remaining_amount": remaining,
            "progress_percentage": min(100.0, percentage),
            "status": goal.status,
            "target_date": goal.target_date,
        }, status=status.HTTP_200_OK)
