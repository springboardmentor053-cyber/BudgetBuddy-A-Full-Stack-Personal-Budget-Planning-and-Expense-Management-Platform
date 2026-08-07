# Added ParagraphStyle import
from notifications_app.utils import send_notification
from reportlab.platypus import HRFlowable
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)
from reportlab.lib.pagesizes import letter
from notifications_app.models import Notification
from savings.models import SavingsGoal
from budgets.models import Budget
from expenses.models import Expense
from income.models import Income
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models.functions import ExtractMonth, Coalesce
from django.db.models import Sum, FloatField
from django.http import HttpResponse
import matplotlib.pyplot as plt
import csv
import io
import pandas as pd
import matplotlib
matplotlib.use('Agg')
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

        if month and month != "ALL" and year:
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

        if month and month != "ALL" and year:
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

        if month and month != "ALL" and year:
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
                "title": getattr(exp, "title", getattr(exp, "name", "")),
                "category": str(exp.category),
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
# TASK 6 - DASHBOARD API
# ==========================================================
class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        income_qs = Income.objects.filter(user=user)
        expense_qs = Expense.objects.filter(user=user)
        budget_qs = Budget.objects.filter(user=user)
        savings_qs = SavingsGoal.objects.filter(user=user)

        if month and month != "ALL" and year:
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
                    "category": str(cat["category"]),
                    "amount": amount,
                    "percentage": pct,
                })

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

        recent_expenses = list(
            expense_qs.order_by("-expense_date")[:5].values(
                "id", "title", "category", "amount", "expense_date",
            )
        )

        recent_income = list(
            income_qs.order_by("-income_date")[:5].values(
                "id", "title", "source", "amount", "income_date",
            )
        )

        latest_notifications = list(
            Notification.objects.filter(user=user)
            .order_by("-created_at")[:5]
            .values(
                "id", "title", "message", "notification_type",
                "priority", "is_read", "created_at",
            )
        )

        active_savings_goals = list(
            savings_qs.filter(status="ACTIVE").values(
                "id", "goal_name", "goal_type", "target_amount",
                "saved_amount", "target_date", "status",
            )
        )

        active_budgets = list(
            budget_qs.values(
                "id", "category", "monthly_limit"
            )
        )

        return Response({
            "financial_summary": financial_summary,
            "category_analysis": category_analysis,
            "monthly_trend": monthly_trend,
            "recent_income": recent_income,
            "recent_expenses": recent_expenses,
            "active_savings_goals": active_savings_goals,
            "latest_notifications": latest_notifications,
            "active_budgets": active_budgets,
        })

# ==========================================================
# TASK 7 - EXPORT REPORT API (PDF, Excel, CSV Downloads)
# ==========================================================


class ExportReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        print("========== EXPORT REPORT API CALLED ==========")
        user = request.user
        export_format = request.query_params.get(
            "export_format", "csv").lower()

        # Safely handle month and year query params
        raw_month = request.query_params.get("month")
        year = request.query_params.get("year")

        month = None
        if raw_month and raw_month != "ALL" and raw_month != "null" and raw_month != "undefined":
            try:
                month = int(raw_month)
            except ValueError:
                month = None

        safe_year = None
        if year and year != "ALL" and year != "null" and year != "undefined":
            try:
                safe_year = int(year)
            except ValueError:
                safe_year = None

        # ----------------------------------------------------
        # 1. FETCH & FILTER ALL DATA
        # ----------------------------------------------------
        income_qs = Income.objects.filter(user=user)
        expense_qs = Expense.objects.filter(user=user)
        budget_qs = Budget.objects.filter(user=user)
        savings_qs = SavingsGoal.objects.filter(user=user)

        if month and safe_year:
            income_qs = income_qs.filter(
                income_date__month=month, income_date__year=safe_year)
            expense_qs = expense_qs.filter(
                expense_date__month=month, expense_date__year=safe_year)
            if hasattr(Budget, "period"):
                budget_qs = budget_qs.filter(
                    period__icontains=f"{month}/{safe_year}")
            elif hasattr(Budget, "created_at"):
                budget_qs = budget_qs.filter(
                    created_at__month=month, created_at__year=safe_year)
        elif safe_year:
            income_qs = income_qs.filter(income_date__year=safe_year)
            expense_qs = expense_qs.filter(expense_date__year=safe_year)
            if hasattr(Budget, "period"):
                budget_qs = budget_qs.filter(period__icontains=f"{safe_year}")
            elif hasattr(Budget, "created_at"):
                budget_qs = budget_qs.filter(created_at__year=safe_year)

        expenses = expense_qs.order_by("-expense_date")
        incomes = income_qs.order_by("-income_date")
        budgets = budget_qs.all()
        savings = savings_qs.all()

        # ----------------------------------------------------
        # 2. FINANCIAL CALCULATIONS
        # ----------------------------------------------------
        total_income = float(income_qs.aggregate(total=Coalesce(
            Sum("amount", output_field=FloatField()), 0.0))["total"])
        total_expense = float(expense_qs.aggregate(total=Coalesce(
            Sum("amount", output_field=FloatField()), 0.0))["total"])
        total_budget = float(budget_qs.aggregate(total=Coalesce(
            Sum("monthly_limit", output_field=FloatField()), 0.0))["total"])
        total_savings = float(savings_qs.aggregate(total=Coalesce(
            Sum("saved_amount", output_field=FloatField()), 0.0))["total"])

        current_balance = total_income - total_expense
        remaining_budget = total_budget - total_expense

        period_str = f"Month: {month} / Year: {safe_year}" if month else f"Year: {safe_year if safe_year else 'All Time'}"

        # ----------------------------------------------------
        # 3. CSV EXPORT
        # ----------------------------------------------------
        if export_format == "csv":
            response = HttpResponse(content_type="text/csv")
            response[
                "Content-Disposition"] = f'attachment; filename="financial_report_{raw_month}_{year}.csv"'

            writer = csv.writer(response)
            writer.writerow(["=== FINANCIAL SUMMARY ==="])
            writer.writerow(["Period", period_str])
            writer.writerow(["Total Income", total_income])
            writer.writerow(["Total Expense", total_expense])
            writer.writerow(["Current Balance", current_balance])
            writer.writerow(["Total Budget", total_budget])
            writer.writerow(["Remaining Budget", remaining_budget])
            writer.writerow(["Total Savings", total_savings])
            writer.writerow([])

            writer.writerow(["=== INCOME TRANSACTIONS ==="])
            writer.writerow(["ID", "Source/Title", "Amount", "Date"])
            for inc in incomes:
                source = getattr(inc, "source", getattr(
                    inc, "title", "Income"))
                writer.writerow([inc.id, source, inc.amount, inc.income_date.strftime(
                    "%Y-%m-%d") if inc.income_date else ""])
            writer.writerow([])

            writer.writerow(["=== EXPENSE TRANSACTIONS ==="])
            writer.writerow(["ID", "Category", "Amount", "Date"])
            for exp in expenses:
                writer.writerow([exp.id, str(exp.category), exp.amount, exp.expense_date.strftime(
                    "%Y-%m-%d") if exp.expense_date else ""])
            writer.writerow([])

            writer.writerow(["=== BUDGET OVERVIEW ==="])
            writer.writerow(["ID", "Category/Period", "Monthly Limit"])
            for bgt in budgets:
                cat_or_period = getattr(
                    bgt, "category", getattr(bgt, "period", "Budget"))
                writer.writerow(
                    [bgt.id, str(cat_or_period), bgt.monthly_limit])
            writer.writerow([])

            writer.writerow(["=== SAVINGS GOALS ==="])
            writer.writerow(
                ["ID", "Goal Name", "Saved Amount", "Target Amount", "Status"])
            for svg in savings:
                writer.writerow(
                    [svg.id, svg.goal_name, svg.saved_amount, svg.target_amount, svg.status])

            return response

        # ----------------------------------------------------
        # 4. EXCEL EXPORT
        # ----------------------------------------------------
        elif export_format in ["excel", "xlsx"]:
            summary_df = pd.DataFrame([
                {"Metric": "Period", "Value": period_str},
                {"Metric": "Total Income", "Value": total_income},
                {"Metric": "Total Expense", "Value": total_expense},
                {"Metric": "Current Balance", "Value": current_balance},
                {"Metric": "Total Budget", "Value": total_budget},
                {"Metric": "Remaining Budget", "Value": remaining_budget},
                {"Metric": "Total Savings", "Value": total_savings},
            ])

            income_df = pd.DataFrame([
                {
                    "ID": inc.id,
                    "Source": getattr(inc, "source", getattr(inc, "title", "Income")),
                    "Amount": float(inc.amount),
                    "Date": inc.income_date.strftime("%Y-%m-%d") if inc.income_date else "",
                } for inc in incomes
            ] or [{"ID": "", "Source": "No Income Recorded", "Amount": 0.0, "Date": ""}])

            expense_df = pd.DataFrame([
                {
                    "ID": exp.id,
                    "Category": str(exp.category),
                    "Amount": float(exp.amount),
                    "Date": exp.expense_date.strftime("%Y-%m-%d") if exp.expense_date else "",
                } for exp in expenses
            ] or [{"ID": "", "Category": "No Expenses Recorded", "Amount": 0.0, "Date": ""}])

            budget_df = pd.DataFrame([
                {
                    "ID": bgt.id,
                    "Category/Period": str(getattr(bgt, "category", getattr(bgt, "period", "Budget"))),
                    "Limit": float(bgt.monthly_limit),
                } for bgt in budgets
            ] or [{"ID": "", "Category/Period": "No Budgets Configured", "Limit": 0.0}])

            savings_df = pd.DataFrame([
                {
                    "ID": svg.id,
                    "Goal Name": svg.goal_name,
                    "Saved Amount": float(svg.saved_amount),
                    "Target Amount": float(svg.target_amount),
                    "Status": svg.status,
                } for svg in savings
            ] or [{"ID": "", "Goal Name": "No Savings Goals Found", "Saved Amount": 0.0, "Target Amount": 0.0, "Status": ""}])

            output = io.BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                summary_df.to_excel(writer, index=False, sheet_name="Summary")
                income_df.to_excel(writer, index=False, sheet_name="Income")
                expense_df.to_excel(writer, index=False, sheet_name="Expenses")
                budget_df.to_excel(writer, index=False, sheet_name="Budgets")
                savings_df.to_excel(writer, index=False,
                                    sheet_name="Savings Goals")

            output.seek(0)
            response = HttpResponse(
                output.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response[
                "Content-Disposition"] = f'attachment; filename="financial_report_{raw_month}_{year}.xlsx"'
            return response

        # ----------------------------------------------------
        # 5. PDF EXPORT
        # ----------------------------------------------------
        elif export_format == "pdf":
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=36
            )
            styles = getSampleStyleSheet()

            section_heading = ParagraphStyle(
                'SectionHeading',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=14,
                textColor=colors.HexColor('#0F172A'),
                spaceBefore=12,
                spaceAfter=6
            )

            elements = []

            elements.append(
                Paragraph(f"Financial Report - {period_str}", styles["Title"]))
            elements.append(Spacer(1, 10))

            # --- A. FINANCIAL SUMMARY TABLE ---
            elements.append(Paragraph("1. Executive Summary", section_heading))
            summary_data = [
                ["Metric", "Amount"],
                ["Total Income", f"Rs.{total_income:,.2f}"],
                ["Total Expense", f"Rs.{total_expense:,.2f}"],
                ["Current Balance", f"Rs.{current_balance:,.2f}"],
                ["Total Budget Limit", f"Rs.{total_budget:,.2f}"],
                ["Remaining Budget", f"Rs.{remaining_budget:,.2f}"],
                ["Total Savings", f"Rs.{total_savings:,.2f}"],
            ]

            summary_table = Table(summary_data, colWidths=[270, 270])
            summary_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (0, 0), (0, -1), "LEFT"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
            ]))
            elements.append(summary_table)
            elements.append(Spacer(1, 15))

            # --- B. CHARTS GENERATION ---
            category_data = (
                expense_qs.values("category")
                .annotate(total=Coalesce(Sum("amount", output_field=FloatField()), 0.0))
                .order_by("-total")
            )

            if category_data.exists():
                elements.append(
                    Paragraph("2. Financial Visualizations", section_heading))

                fig, (ax1, ax2) = plt.subplots(
                    1, 2, figsize=(8.5, 3.5), dpi=150)

                ax1.bar(["Income", "Expense"], [total_income,
                        total_expense], color=["#10B981", "#EF4444"])
                ax1.set_title("Income vs Expense",
                              fontsize=10, fontweight="bold")
                ax1.set_ylabel("Amount ($)", fontsize=8)
                ax1.tick_params(axis='both', labelsize=8)

                labels = [str(item["category"]) for item in category_data]
                values = [float(item["total"]) for item in category_data]
                ax2.pie(values, labels=labels, autopct='%1.1f%%',
                        startangle=140, textprops={'fontsize': 7})
                ax2.set_title("Expense Category Share",
                              fontsize=10, fontweight="bold")

                plt.tight_layout()

                chart_buffer = io.BytesIO()
                plt.savefig(chart_buffer, format='png', bbox_inches='tight')
                plt.close(fig)
                chart_buffer.seek(0)

                elements.append(Image(chart_buffer, width=540, height=220))
                elements.append(Spacer(1, 15))

            # --- C. INCOME DETAILS ---
            elements.append(
                Paragraph("3. Income Transactions", section_heading))
            inc_table_data = [["ID", "Source", "Amount", "Date"]]
            for inc in incomes:
                inc_table_data.append([
                    str(inc.id),
                    str(getattr(inc, "source", getattr(inc, "title", "Income"))),
                    f"Rs.{float(inc.amount):.2f}",
                    inc.income_date.strftime(
                        "%Y-%m-%d") if inc.income_date else "",
                ])
            if len(inc_table_data) == 1:
                inc_table_data.append(["-", "No Income Recorded", "-", "-"])

            inc_t = Table(inc_table_data, colWidths=[60, 240, 120, 120])
            inc_t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F766E")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(inc_t)
            elements.append(Spacer(1, 15))

            # --- D. EXPENSE DETAILS ---
            elements.append(
                Paragraph("4. Expense Transactions", section_heading))
            exp_table_data = [["ID", "Category", "Amount", "Date"]]
            for exp in expenses:
                exp_table_data.append([
                    str(exp.id),
                    str(exp.category),
                    f"Rs.{float(exp.amount):.2f}",
                    exp.expense_date.strftime(
                        "%Y-%m-%d") if exp.expense_date else "",
                ])
            if len(exp_table_data) == 1:
                exp_table_data.append(["-", "No Expenses Recorded", "-", "-"])

            exp_t = Table(exp_table_data, colWidths=[60, 240, 120, 120])
            exp_t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#991B1B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(exp_t)
            elements.append(Spacer(1, 15))

            # --- E. BUDGET OVERVIEW TABLE ---
            elements.append(
                Paragraph("5. Budget Allocations", section_heading))
            bgt_table_data = [["ID", "Category", "Monthly Limit"]]
            for bgt in budgets:
                bgt_table_data.append([
                    str(bgt.id),
                    str(getattr(bgt, "category", getattr(bgt, "period", "Budget"))),
                    f"Rs.{float(bgt.monthly_limit):.2f}",
                ])
            if len(bgt_table_data) == 1:
                bgt_table_data.append(["-", "No Budgets Configured", "-"])

            bgt_t = Table(bgt_table_data, colWidths=[60, 280, 200])
            bgt_t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(bgt_t)
            elements.append(Spacer(1, 15))

            # --- F. SAVINGS GOALS ---
            elements.append(
                Paragraph("6. Savings Goals Status", section_heading))
            svg_table_data = [
                ["ID", "Goal", "Saved Amount", "Target Amount", "Status"]]
            for svg in savings:
                svg_table_data.append([
                    str(svg.id),
                    str(svg.goal_name),
                    f"Rs.{float(svg.saved_amount):.2f}",
                    f"Rs.{float(svg.target_amount):.2f}",
                    str(svg.status),
                ])
            if len(svg_table_data) == 1:
                svg_table_data.append(
                    ["-", "No Savings Goals Found", "-", "-", "-"])

            svg_t = Table(svg_table_data, colWidths=[50, 190, 100, 100, 100])
            svg_t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(svg_t)

            doc.build(elements)

            buffer.seek(0)
            print("Sending report notification...")
            send_notification(
                user=user,
                title="Financial Report Generated",
                message=f"Your financial report for {period_str} has been generated and is ready for download.",
                notification_type="GENERAL",
                priority="MEDIUM"
            )
            response = HttpResponse(
                buffer.getvalue(), content_type="application/pdf")
            response[
                "Content-Disposition"] = f'attachment; filename="financial_report_{raw_month}_{year}.pdf"'
            return response

        return Response({"error": "Invalid format requested"}, status=status.HTTP_400_BAD_REQUEST)
