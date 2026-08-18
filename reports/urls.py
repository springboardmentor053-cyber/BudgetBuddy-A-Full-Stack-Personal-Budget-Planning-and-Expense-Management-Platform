from django.urls import path

from .views import (
    monthly_report,
    expense_report,
    savings_report,
    financial_summary_report,
    export_report,
)

urlpatterns = [

    path(
        "reports/monthly/",
        monthly_report,
        name="monthly-report",
    ),

    path(
        "reports/expenses/",
        expense_report,
        name="expense-report",
    ),
    path(
        "reports/savings/",
        savings_report,
        name="savings-report",
    ),
    path(
        "reports/summary/",
        financial_summary_report,
        name="financial-summary-report",
    ),
    path(
        "reports/export/",
        export_report,
        name="export-report",
    ),

]