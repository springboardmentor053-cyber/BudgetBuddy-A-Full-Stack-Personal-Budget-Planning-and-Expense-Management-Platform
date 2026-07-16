from django.urls import path
from .views import FinancialSummaryView

urlpatterns = [
    path("summary/", FinancialSummaryView.as_view(), name="financial-summary"),
]