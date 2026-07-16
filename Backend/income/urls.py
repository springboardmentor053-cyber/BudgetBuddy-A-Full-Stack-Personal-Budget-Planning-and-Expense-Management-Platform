from django.urls import path
from .views import IncomeListCreateView
from .views import IncomeDetailView
from .views import FinancialSummaryView

urlpatterns = [

    path('', IncomeListCreateView.as_view()),
    path('<int:pk>/', IncomeDetailView.as_view()),
    path('summary/', FinancialSummaryView.as_view()),

]