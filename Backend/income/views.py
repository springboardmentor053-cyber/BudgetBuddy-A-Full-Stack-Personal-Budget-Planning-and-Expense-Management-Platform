from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Income
from .serializers import IncomeSerializer
# from notifications_app.utils import send_notification


class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        income = serializer.save(user=self.request.user)

        # 🚀 Trigger notification & email for Income
        # send_notification(
        #     user=self.request.user,
        #     title="Income Added",
        #     message=f"You successfully logged an income: {income.title} for ₹{income.amount}.",
        #     notification_type="INCOME",
        #     priority="MEDIUM",
        # )


class IncomeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
