from django.urls import path
from .views import CombinedDashboardView, ExtremeExpensesView

urlpatterns = [
    path('dashboard/', CombinedDashboardView.as_view(), name='combined-dashboard'),
    path('extreme-expenses/', ExtremeExpensesView.as_view(), name='extreme-expenses'),
]