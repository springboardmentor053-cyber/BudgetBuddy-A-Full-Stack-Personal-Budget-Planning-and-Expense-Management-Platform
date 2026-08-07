from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .services import (
    get_financial_summary,
    get_expense_report,
    get_savings_report,
    get_combined_financial_summary,
    get_category_expense_analysis,
    get_monthly_expense_trend,
    get_expense_extremes_and_bounds,
    parse_date_filters,
    filter_transactions,
)
from expenses.models import Expense
from notifications.models import Notification


# Task 2 – Create Monthly Financial Report API
class MonthlyFinancialReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_financial_summary(
            request.user,
            month=filters["month"],
            year=filters["year"],
            start_date=filters["start_date"],
            end_date=filters["end_date"],
        )
        return Response(data, status=status.HTTP_200_OK)


# Task 3 & Task 6 – Create Expense Report API (with Date Filters)
class ExpenseReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_expense_report(
            request.user,
            month=filters["month"],
            year=filters["year"],
            start_date=filters["start_date"],
            end_date=filters["end_date"],
        )
        return Response(data, status=status.HTTP_200_OK)


# Task 4 – Create Savings Report API
class SavingsReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = get_savings_report(request.user)
        return Response(data, status=status.HTTP_200_OK)


# Task 5 & Task 7 – Combine All Reports (Export-Ready Payload)
class CombinedFinancialSummaryReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_combined_financial_summary(
            request.user,
            month=filters["month"],
            year=filters["year"],
            start_date=filters["start_date"],
            end_date=filters["end_date"],
        )
        return Response(data, status=status.HTTP_200_OK)


# Dashboard Endpoint
class FinancialSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_financial_summary(request.user, **filters)
        return Response(data, status=status.HTTP_200_OK)


class CategoryExpenseAnalysisAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_category_expense_analysis(request.user, **filters)
        return Response(data, status=status.HTTP_200_OK)


class MonthlyExpenseTrendAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_monthly_expense_trend(request.user, **filters)
        return Response(data, status=status.HTTP_200_OK)


class ExpenseExtremesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = parse_date_filters(request)
        data = get_expense_extremes_and_bounds(request.user, **filters)
        return Response(data, status=status.HTTP_200_OK)


class DashboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        filters = parse_date_filters(request)

        recent_expenses = filter_transactions(
            Expense.objects.filter(user=user),
            "expense_date",
            **filters,
        ).order_by("-expense_date")[:5]
        recent_transactions = [
            {
                "id": exp.id,
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category,
                "date": exp.expense_date.strftime("%Y-%m-%d") if getattr(exp, 'expense_date', None) else (exp.created_at.strftime("%Y-%m-%d") if exp.created_at else None),
            }
            for exp in recent_expenses
        ]

        dashboard_payload = {
            "financial_summary": get_financial_summary(user, **filters),
            "category_wise_analysis": get_category_expense_analysis(user, **filters),
            "monthly_trend": get_monthly_expense_trend(user, **filters),
            "recent_transactions": recent_transactions,
            "latest_notifications": [
                {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "priority": notification.priority,
                    "is_read": notification.is_read,
                    "created_at": notification.created_at.strftime("%Y-%m-%d") if notification.created_at else None,
                }
                for notification in Notification.objects.filter(user=user).order_by("-created_at")[:5]
            ],
            "active_savings_goals": get_savings_report(user),
        }

        return Response(dashboard_payload, status=status.HTTP_200_OK)
