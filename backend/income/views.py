from rest_framework import viewsets
from rest_framework.permissions import (
    IsAuthenticated,
)

from .models import Income
from .serializers import IncomeSerializer


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Income.objects.none()

        return Income.objects.filter(
            user=self.request.user
        ).order_by(
            "-income_date",
            "-id",
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )