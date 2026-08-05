from decimal import Decimal
from django.db.models import Sum, Count
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification
from savings.serializers import NotificationSerializer
from savings.views import trigger_notifications_for_user

from .serializers import (
    MonthlyFinancialReportSerializer,
    ExpenseReportItemSerializer,
    SavingsReportItemSerializer,
    CombinedFinancialSummaryReportSerializer,
)
from .utils import parse_date_range, ReportExportHandler


def get_category_wise_budget_summary(user, month=None, year=None):
    """
    Computes category-wise total_budget and remaining_budget for a user.
    """
    bgt_qs = Budget.objects.filter(user=user)
    if month and year:
        filtered = bgt_qs.filter(month=month, year=year)
        if filtered.exists():
            bgt_qs = filtered

    total_budget_val = Decimal('0.00')
    total_remaining_val = Decimal('0.00')

    for b in bgt_qs:
        b_amt = Decimal(str(b.budget_amount))
        total_budget_val += b_amt

        cat_exp = Expense.objects.filter(
            user=user,
            category=b.category,
            expense_date__year=b.year,
            expense_date__month=b.month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        b_rem = b_amt - cat_exp
        total_remaining_val += b_rem

    return float(round(total_budget_val, 2)), float(round(total_remaining_val, 2))


class MonthlyFinancialReportView(APIView):
    """
    GET /api/reports/monthly/
    Returns monthly financial aggregates for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        date_info = parse_date_range(request)

        start_date = date_info['start_date']
        end_date = date_info['end_date']
        month = date_info['month']
        year = date_info['year']

        inc_aggregate = Income.objects.filter(
            user=user,
            income_date__range=(start_date, end_date)
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        exp_aggregate = Expense.objects.filter(
            user=user,
            expense_date__range=(start_date, end_date)
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_budget, remaining_budget = get_category_wise_budget_summary(user, month=month, year=year)

        sav_aggregate = SavingsGoal.objects.filter(
            user=user
        ).aggregate(total=Sum('saved_amount'))['total'] or Decimal('0.00')

        total_income = float(inc_aggregate)
        total_expense = float(exp_aggregate)
        total_savings = float(sav_aggregate)

        current_balance = round(total_income - total_expense, 2)

        data = {
            "month": month,
            "year": year,
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "total_savings": total_savings
        }

        serializer = MonthlyFinancialReportSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ExpenseReportView(APIView):
    """
    GET /api/reports/expenses/
    Returns list of expenses filtered by date range.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        date_info = parse_date_range(request)

        expenses_qs = Expense.objects.filter(
            user=user,
            expense_date__range=(date_info['start_date'], date_info['end_date'])
        ).order_by('-expense_date')

        serializer = ExpenseReportItemSerializer(expenses_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SavingsReportView(APIView):
    """
    GET /api/reports/savings/
    Returns savings goals breakdown.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        goals_qs = SavingsGoal.objects.filter(user=user).order_by('target_date', '-created_at')

        serializer = SavingsReportItemSerializer(goals_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CombinedFinancialSummaryReportView(APIView):
    """
    GET /api/reports/summary/ and GET /api/reports/
    Returns combined summary report containing Financial Summary, Expense Summary,
    Income Summary, Budget Summary, Savings Summary, and Latest Notifications.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        date_info = parse_date_range(request)

        start_date = date_info['start_date']
        end_date = date_info['end_date']
        month = date_info['month']
        year = date_info['year']

        trigger_notifications_for_user(user)

        inc_qs = Income.objects.filter(user=user, income_date__range=(start_date, end_date))
        total_income_val = inc_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        exp_qs = Expense.objects.filter(user=user, expense_date__range=(start_date, end_date))
        total_expense_val = exp_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_budget, remaining_budget = get_category_wise_budget_summary(user, month=month, year=year)

        goals_qs = SavingsGoal.objects.filter(user=user)
        total_savings_val = goals_qs.aggregate(total=Sum('saved_amount'))['total'] or Decimal('0.00')
        total_target_val = goals_qs.aggregate(total=Sum('target_amount'))['total'] or Decimal('0.00')

        total_income = float(total_income_val)
        total_expense = float(total_expense_val)
        total_savings = float(total_savings_val)
        total_target = float(total_target_val)

        current_balance = round(total_income - total_expense, 2)

        cat_group = exp_qs.values('category').annotate(amount=Sum('amount'), count=Count('id')).order_by('-amount')
        category_breakdown = [
            {
                "category": item['category'],
                "amount": float(item['amount']),
                "percentage": round((float(item['amount']) / total_expense * 100), 2) if total_expense > 0 else 0.0,
                "count": item['count']
            }
            for item in cat_group
        ]

        notifications_qs = Notification.objects.filter(user=user).order_by('-created_at')[:10]
        notifications_serialized = NotificationSerializer(notifications_qs, many=True).data

        goals_serialized = SavingsReportItemSerializer(goals_qs, many=True).data

        expense_items = ExpenseReportItemSerializer(exp_qs.order_by('-expense_date')[:15], many=True).data

        income_items = [
            {
                "id": inc.id,
                "source": inc.source,
                "amount": float(inc.amount),
                "date": inc.income_date.isoformat(),
                "description": inc.description
            }
            for inc in inc_qs.order_by('-income_date')[:15]
        ]

        financial_summary = {
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "total_savings": total_savings,
            "period": date_info['period_label']
        }

        expense_summary = {
            "total_expense": total_expense,
            "count": exp_qs.count(),
            "category_breakdown": category_breakdown,
            "expenses": expense_items
        }

        income_summary = {
            "total_income": total_income,
            "count": inc_qs.count(),
            "incomes": income_items
        }

        budget_summary = {
            "total_budget": total_budget,
            "total_expense": total_expense,
            "remaining_budget": remaining_budget,
            "count": Budget.objects.filter(user=user).count()
        }

        savings_summary = {
            "total_savings": total_savings,
            "total_target": total_target,
            "goals_count": goals_qs.count(),
            "goals": goals_serialized
        }

        recent_incomes_tx = [
            {"id": inc.id, "type": "Income", "source": inc.source, "amount": float(inc.amount), "date": inc.income_date.isoformat()}
            for inc in inc_qs.order_by('-income_date')[:10]
        ]
        recent_expenses_tx = [
            {"id": exp.id, "type": "Expense", "title": exp.title, "category": exp.category, "amount": float(exp.amount), "date": exp.expense_date.isoformat()}
            for exp in exp_qs.order_by('-expense_date')[:10]
        ]
        recent_transactions = recent_incomes_tx + recent_expenses_tx
        recent_transactions.sort(key=lambda x: x['date'], reverse=True)

        response_data = {
            "financial_summary": financial_summary,
            "expense_summary": expense_summary,
            "income_summary": income_summary,
            "budget_summary": budget_summary,
            "savings_summary": savings_summary,
            "latest_notifications": notifications_serialized,

            # Legacy keys
            "title": f"Financial Report ({date_info['period_label']}) for {user.username}",
            "generated_at": timezone.now().isoformat(),
            "income": {
                "total": total_income,
                "count": inc_qs.count()
            },
            "expenses": {
                "total": total_expense,
                "count": exp_qs.count()
            },
            "savings": {
                "total_savings": total_savings,
                "goals_count": goals_qs.count()
            },
            "budget": {
                "total_budget": total_budget,
                "allocated_categories": Budget.objects.filter(user=user).count()
            },
            "goal_progress": goals_serialized,
            "recent_transactions": recent_transactions[:10]
        }

        return Response(response_data, status=status.HTTP_200_OK)


class ExportPDFReportView(APIView):
    """
    GET /api/reports/export/pdf/
    Generates downloadable PDF report using ReportLab.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        summary_view = CombinedFinancialSummaryReportView()
        response = summary_view.get(request, *args, **kwargs)
        report_data = response.data

        pdf_bytes = ReportExportHandler.export_pdf(request.user, report_data)
        filename = f"BudgetBuddy_Report_{timezone.now().strftime('%Y%m%d')}.pdf"

        resp = HttpResponse(pdf_bytes, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp


class ExportExcelReportView(APIView):
    """
    GET /api/reports/export/excel/
    Generates downloadable multi-sheet Excel workbook using openpyxl.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        summary_view = CombinedFinancialSummaryReportView()
        response = summary_view.get(request, *args, **kwargs)
        report_data = response.data

        excel_bytes = ReportExportHandler.export_excel(request.user, report_data)
        filename = f"BudgetBuddy_Report_{timezone.now().strftime('%Y%m%d')}.xlsx"

        resp = HttpResponse(
            excel_bytes,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp


class ExportReportView(APIView):
    """
    GET /api/reports/export/
    Exports report in requested format (pdf, excel, json).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        fmt = request.query_params.get('format', 'pdf').lower()

        if fmt in ['pdf']:
            return ExportPDFReportView().get(request, *args, **kwargs)
        elif fmt in ['excel', 'xlsx']:
            return ExportExcelReportView().get(request, *args, **kwargs)
        elif fmt == 'json':
            summary_view = CombinedFinancialSummaryReportView()
            response = summary_view.get(request, *args, **kwargs)
            resp = Response(response.data, status=status.HTTP_200_OK)
            resp['Content-Disposition'] = f'attachment; filename="BudgetBuddy_Report_{timezone.now().strftime("%Y%m%d")}.json"'
            return resp
        else:
            return Response({"error": f"Unsupported export format: {fmt}"}, status=status.HTTP_400_BAD_REQUEST)
