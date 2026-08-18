from django.urls import path
from .views import (
    # ReportHomeAPIView,
    MonthlyFinancialReportAPIView,
    ExpenseReportAPIView,
    SavingsReportAPIView,
    FinancialSummaryReportAPIView,
    ExportReportAPIView,
)

urlpatterns = [

    # path("", ReportHomeAPIView.as_view()),

    path(
        "monthly/",
        MonthlyFinancialReportAPIView.as_view(),
    ),
    path("expenses/", ExpenseReportAPIView.as_view()),
    path(
    "summary/",
    FinancialSummaryReportAPIView.as_view(),
    ),
    path(
        "export/",
        ExportReportAPIView.as_view(),
    ),
    path("savings/", SavingsReportAPIView.as_view()),


]