from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication  # <-- 1. IMPORT THIS
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

# Task 4: CRUD APIs with JWT Authentication Protection
class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    authentication_classes = [JWTAuthentication]  # <-- 2. EXPLICITLY ENFORCE JWT
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Task 5: Goal Progress API
class GoalProgressView(APIView):
    authentication_classes = [JWTAuthentication]  # <-- 3. EXPLICITLY ENFORCE JWT
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        try:
            goal = SavingsGoal.objects.get(pk=pk, user=request.user)
        except SavingsGoal.DoesNotExist:
            return Response({"error": "Savings goal not found."}, status=status.HTTP_404_NOT_FOUND)

        target_amount = float(goal.target_amount)
        saved_amount = float(goal.saved_amount)

        # Formulae specified in image:
        # Remaining amount = Goal Amount - Current Savings
        remaining_amount = max(0.0, target_amount - saved_amount)

        # Progress % = (Current Savings / Goal Amount) * 100
        progress_percentage = (saved_amount / target_amount) * 100 if target_amount > 0 else 0.0

        return Response({
            "goal_name": goal.goal_name,
            "target_amount": target_amount,
            "saved_amount": saved_amount,
            "remaining_amount": float(remaining_amount),
            "progress_percentage": round(progress_percentage, 2),
            "goal_status": getattr(goal, 'status', 'In Progress')
        })