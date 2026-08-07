import csv
import io
import pandas as pd

from django.http import HttpResponse
from django.db.models import Sum, FloatField, Q
from django.db.models.functions import ExtractMonth, Coalesce

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications_app.models import Notification

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors


# ==========================================================
# TASK 2 - FINANCIAL SUMMARY API
# ==========================================================

class FinancialSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        income_qs = Income.objects.filter(user=user)
        expense_qs = Expense.objects.filter(user=user)
        budget_qs = Budget.objects.filter(user=user)
        savings_qs = SavingsGoal.objects.filter(user=user)

        if month and year:
            income_qs = income_qs.filter(
                income_date__month=month, income_date__year=year
            )
            expense_qs = expense_qs.filter(
                expense_date__month=month, expense_date__year=year
            )
            if hasattr(Budget, "period"):
                budget_qs = budget_qs.filter(
                    period__icontains=f"{month}/{year}"
                )
            elif hasattr(Budget, "created_at"):
                budget_qs = budget_qs.filter(
                    created_at__month=month, created_at__year=year
                )

        total_income = float(
            income_qs.aggregate(
                total=Coalesce(Sum("amount", output_field=FloatField()), 0.0)
            )["total"]
        )
        total_expense = float(
            expense_qs.aggregate(
                total=Coalesce(Sum("amount", output_field=FloatField()), 0.0)
            )["total"]
        )
        total_budget = float(
            budget_qs.aggregate(
                total=Coalesce(
                    Sum("monthly_limit", output_field=FloatField()), 0.0
                )
            )["total"]
        )
        total_savings = float(
            savings_qs.aggregate(
                total=Coalesce(
                    Sum("saved_amount", output_field=FloatField()), 0.0
                )
            )["total"]
        )

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": total_income - total_expense,
            "total_savings": total_savings,
            "remaining_budget": total_budget - total_expense,
        })


# ==========================================================
# TASK 3 - CATEGORY WISE EXPENSE ANALYSIS
# ==========================================================

class CategoryAnalysisAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        expense_qs = Expense.objects.filter(user=request.user)

        if month and year:
            expense_qs = expense_qs.filter(
                expense_date__month=month, expense_date__year=year
            )

        category_data = (
            expense_qs.values("category")
            .annotate(
                total_spending=Coalesce(
                    Sum("amount", output_field=FloatField()), 0.0
                )
            )
            .order_by("category")
        )

        return Response(category_data)


# ==========================================================
# TASK 4 - MONTHLY EXPENSE TREND API
# ==========================================================

class MonthlyExpenseTrendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")

        expense_qs = Expense.objects.filter(user=request.user)

        if year:
            expense_qs = expense_qs.filter(expense_date__year=year)

        monthly_data = (
            expense_qs.annotate(month=ExtractMonth("expense_date"))
            .values("month")
            .annotate(
                total_expense=Coalesce(
                    Sum("amount", output_field=FloatField()), 0.0
                )
            )
            .order_by("month")
        )

        return Response(monthly_data)


# ==========================================================
# TASK 5 - HIGHEST & LOWEST EXPENSE API
# ==========================================================

class HighestLowestExpenseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        expenses = Expense.objects.filter(user=request.user)

        if month and year:
            expenses = expenses.filter(
                expense_date__month=month, expense_date__year=year
            )

        highest = expenses.order_by("-amount").first()
        lowest = expenses.order_by("amount").first()
        latest = expenses.order_by("-expense_date").first()
        oldest = expenses.order_by("expense_date").first()

        def serialize_expense(exp):
            if not exp:
                return None
            return {
                "title": exp.title,
                "category": exp.category,
                "amount": float(exp.amount),
                "expense_date": exp.expense_date,
            }

        return Response({
            "highest_expense": serialize_expense(highest),
            "lowest_expense": serialize_expense(lowest),
            "latest_expense": serialize_expense(latest),
            "oldest_expense": serialize_expense(oldest),
        })


# ==========================================================
# TASK 6 - DASHBOARD API (Aggregated for Reports & Recharts)
# ==========================================================

class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        # Base Filtered Querysets
        income_qs = Income.objects.filter(user=user)
        expense_qs = Expense.objects.filter(user=user)
        budget_qs = Budget.objects.filter(user=user)
        savings_qs = SavingsGoal.objects.filter(user=user)

        if month and year:
            income_qs = income_qs.filter(
                income_date__month=month, income_date__year=year
            )
            expense_qs = expense_qs.filter(
                expense_date__month=month, expense_date__year=year
            )
            if hasattr(Budget, "period"):
                budget_qs = budget_qs.filter(
                    period__icontains=f"{month}/{year}"
                )
            elif hasattr(Budget, "created_at"):
                budget_qs = budget_qs.filter(
                    created_at__month=month, created_at__year=year
                )

        # ---------- Financial Summary ----------
        total_income = float(
            income_qs.aggregate(
                total=Coalesce(Sum("amount", output_field=FloatField()), 0.0)
            )["total"]
        )

        total_expense = float(
            expense_qs.aggregate(
                total=Coalesce(Sum("amount", output_field=FloatField()), 0.0)
            )["total"]
        )

        total_budget = float(
            budget_qs.aggregate(
                total=Coalesce(
                    Sum("monthly_limit", output_field=FloatField()), 0.0
                )
            )["total"]
        )

        total_savings = float(
            savings_qs.aggregate(
                total=Coalesce(
                    Sum("saved_amount", output_field=FloatField()), 0.0
                )
            )["total"]
        )

        net_savings = max(0.0, total_income - total_expense)
        budget_usage_percentage = (
            round((total_expense / total_budget * 100), 1)
            if total_budget > 0
            else 0.0
        )

        financial_summary = {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_savings": net_savings,
            "total_savings": total_savings,
            "budget_usage_percentage": budget_usage_percentage,
            "remaining_budget": total_budget - total_expense,
        }

        # ---------- Category Analysis ----------
        category_qs = (
            expense_qs.values("category")
            .annotate(
                amount=Coalesce(Sum("amount", output_field=FloatField()), 0.0)
            )
            .order_by("category")
        )

        category_analysis = []
        for cat in category_qs:
            amount = float(cat["amount"])
            if amount > 0:
                pct = (
                    round((amount / total_expense * 100), 1)
                    if total_expense > 0
                    else 0.0
                )
                category_analysis.append({
                    "category": cat["category"],
                    "amount": amount,
                    "percentage": pct,
                })

        # ---------- Monthly Trend ----------
        MONTH_NAMES = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]

        trend_income_qs = (
            Income.objects.filter(user=user, income_date__year=year)
            if year
            else Income.objects.filter(user=user)
        )
        trend_expense_qs = (
            Expense.objects.filter(user=user, expense_date__year=year)
            if year
            else Expense.objects.filter(user=user)
        )

        income_by_month = (
            trend_income_qs.annotate(m=ExtractMonth("income_date"))
            .values("m")
            .annotate(total=Sum("amount"))
        )

        expense_by_month = (
            trend_expense_qs.annotate(m=ExtractMonth("expense_date"))
            .values("m")
            .annotate(total=Sum("amount"))
        )

        inc_map = {
            item["m"]: float(item["total"])
            for item in income_by_month
            if item["m"]
        }
        exp_map = {
            item["m"]: float(item["total"])
            for item in expense_by_month
            if item["m"]
        }

        all_months = sorted(list(set(inc_map.keys()) | set(exp_map.keys())))
        monthly_trend = [
            {
                "month": MONTH_NAMES[m - 1],
                "income": inc_map.get(m, 0.0),
                "expense": exp_map.get(m, 0.0),
            }
            for m in all_months
            if 1 <= m <= 12
        ]
# ---------- Recent Income & Expenses (Unfiltered by Month/Year) ----------
        recent_expenses = list(
            Expense.objects.filter(user=user)
            .order_by("-expense_date")[:5]
            .values("id", "title", "category", "amount", "expense_date")
        )

        recent_income_qs = Income.objects.filter(
            user=user).order_by("-income_date")[:5]
        recent_income = [
            {
                "id": inc.id,
                "title": inc.title,
                "source": inc.source,
                "amount": float(inc.amount),
                "income_date": str(inc.income_date),
            }
            for inc in recent_income_qs
        ]
        # Safe fallback for SavingsGoal status field check
        active_savings_qs = savings_qs
        if hasattr(SavingsGoal, "status"):
            active_savings_qs = active_savings_qs.filter(status="ACTIVE")
        elif hasattr(SavingsGoal, "is_completed"):
            active_savings_qs = active_savings_qs.filter(is_completed=False)

        active_savings_goals = list(
            active_savings_qs.values(
                "id",
                "goal_name",
                "goal_type",
                "target_amount",
                "saved_amount",
                "target_date",
            )
        )

        return Response({
            "financial_summary": financial_summary,
            "category_analysis": category_analysis,
            "monthly_trend": monthly_trend,
            "recent_income": recent_income,
            "recent_expenses": recent_expenses,
            "latest_notifications": latest_notifications,
            "active_savings_goals": active_savings_goals,
        })

# ==========================================================
# TASK 7 - EXPORT REPORT API (PDF, Excel, CSV Downloads)
# ==========================================================


class ExportReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        export_format = request.query_params.get("format", "csv").lower()
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        user = request.user

        expenses = Expense.objects.filter(user=user)

        if month and year:
            expenses = expenses.filter(
                expense_date__month=month, expense_date__year=year
            )

        expenses = expenses.order_by("-expense_date")

        if export_format == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = (
                'attachment; filename="expense_report.csv"'
            )
            writer = csv.writer(response)
            writer.writerow(["Title", "Category", "Amount", "Date"])
            for e in expenses:
                writer.writerow(
                    [e.title, e.category, e.amount, e.expense_date]
                )
            return response

        elif export_format == "excel":
            data = [
                {
                    "Title": e.title,
                    "Category": e.category,
                    "Amount": float(e.amount),
                    "Date": str(e.expense_date),
                }
                for e in expenses
            ]
            df = pd.DataFrame(data)
            output = io.BytesIO()
            df.to_excel(output, index=False, sheet_name="Expenses")
            output.seek(0)

            response = HttpResponse(
                output.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response["Content-Disposition"] = (
                'attachment; filename="expense_report.xlsx"'
            )
            return response

        elif export_format == "pdf":
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = [
                Paragraph("Financial Expense Report", styles["Heading1"]),
                Spacer(1, 12),
            ]

            table_data = [["Title", "Category", "Amount", "Date"]]
            for e in expenses:
                table_data.append([
                    e.title,
                    e.category,
                    f"₹{float(e.amount):.2f}",
                    str(e.expense_date),
                ])

            t = Table(table_data)
            t.setStyle(
                TableStyle([
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#1f2937"),
                    ),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    (
                        "BACKGROUND",
                        (0, 1),
                        (-1, -1),
                        colors.HexColor("#f9fafb"),
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#e5e7eb"),
                    ),
                ])
            )
            story.append(t)
            doc.build(story)
            buffer.seek(0)

            response = HttpResponse(
                buffer.getvalue(), content_type="application/pdf"
            )
            response["Content-Disposition"] = (
                'attachment; filename="expense_report.pdf"'
            )
            return response

        return Response(
            {"error": "Invalid format requested. Choose csv, excel, or pdf."},
            status=status.HTTP_400_BAD_REQUEST,
        )
