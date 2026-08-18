from decimal import Decimal
import csv
import calendar
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from notifications.models import Notification
from django.db.models import Sum
from django.http import HttpResponse
from income.models import Income
from expenses.models import Expense
from savings.models import SavingsGoal
from budgets.models import Budget


# class MonthlyFinancialReportAPIView(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         print("MONTHLY REPORT API HIT")

#         from datetime import date

#         today = date.today()

#         month = request.GET.get("month") or today.month
#         year = request.GET.get("year") or today.year
#         # month_name = calendar.month_name[int(month)]
#         income = Income.objects.filter(user=request.user)
#         expense = Expense.objects.filter(user=request.user)
#         savings = SavingsGoal.objects.filter(user=request.user)

#         if month and year:
#             savings = savings.filter(
#                 target_date__month=month,
#                 target_date__year=year
#             )
#         budget = Budget.objects.filter(user=request.user)

#         if month and year:
#             income = income.filter(
#                 income_date__month=month,
#                 income_date__year=year,
#             )

#             expense = expense.filter(
#                 expense_date__month=month,
#                 expense_date__year=year,
#             )

#             month_name = calendar.month_name[int(month)]

#             if month and year:
#                 budget = budget.filter(
#                 month__icontains=month_name,
#                 year=int(year),
#             )
#                 print("MONTH NAME =", month_name)
#                 print("BUDGET QUERY =", budget.values())

#         total_income = (
#             income.aggregate(total=Sum("amount"))["total"]
#             or Decimal("0")
#         )

#         total_expense = (
#             expense.aggregate(total=Sum("amount"))["total"]
#             or Decimal("0")
#         )

#         total_savings = savings.aggregate(
#     total=Sum("saved_amount")
# )["total"] or 0

#         total_budget = (
#             budget.aggregate(total=Sum("budget_amount"))["total"]
#             or Decimal("0")
#         )
#         print("MONTH =", month)
#         print("YEAR =", year)
#         print("BUDGET RECORDS =", budget.count())
#         print("TOTAL BUDGET =", total_budget)
#         print("TOTAL EXPENSE =", total_expense)
#         print("REMAINING =", total_budget - total_expense)

#         print("MONTH =", month)
#         print("YEAR =", year)

#         print(
#             "BUDGET RECORDS =",
#             budget.count()
#         )

#         print(
#             "TOTAL BUDGET =",
#             total_budget
#         )

#         print(
#             "TOTAL EXPENSE =",
#             total_expense
#         )
 
#         print(
#             "REMAINING =",
#             total_budget - total_expense
#         )

#         return Response({

#             "month": month,
#             "year": year,

#             "total_income": float(total_income),

#             "total_expense": float(total_expense),

#             "current_balance": float(
#                 total_income - total_expense
#             ),
#             "total_savings": float(total_savings),

#             "remaining_budget": float(
#     max(
#         Decimal("0"),
#         total_budget - total_expense
#     )
# ),

#         })
class MonthlyFinancialReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        print("MONTHLY REPORT API HIT")

        today = date.today()

        month = int(request.GET.get("month") or today.month)
        year = int(request.GET.get("year") or today.year)

        income = Income.objects.filter(
            user=request.user,
            income_date__month=month,
            income_date__year=year,
        )

        expense = Expense.objects.filter(
            user=request.user,
            expense_date__month=month,
            expense_date__year=year,
        )

        savings = SavingsGoal.objects.filter(
            user=request.user,
            target_date__month=month,
            target_date__year=year,
        )

        month_name = calendar.month_name[month]

        budgets = Budget.objects.filter(
            user=request.user,
            month__iexact=month_name,
            year=year,
        )

        total_income = (
            income.aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )

        total_expense = (
            expense.aggregate(total=Sum("amount"))["total"]
            or Decimal("0")
        )

        total_savings = (
            savings.aggregate(total=Sum("saved_amount"))["total"]
            or Decimal("0")
        )

        # CATEGORY-WISE REMAINING BUDGET
        monthly_remaining_budget = Decimal("0")

        for budget in budgets:

            spent = (
                Expense.objects.filter(
                    user=request.user,
                    category=budget.category,
                    expense_date__month=month,
                    expense_date__year=year,
                ).aggregate(total=Sum("amount"))["total"]
                or Decimal("0")
            )

            remaining = max(
                Decimal("0"),
                budget.budget_amount - spent
            )

            monthly_remaining_budget += remaining

            print(
                f"{budget.category} | "
                f"Budget={budget.budget_amount} | "
                f"Spent={spent} | "
                f"Remaining={remaining}"
            )

        print("MONTH =", month)
        print("YEAR =", year)
        print("TOTAL INCOME =", total_income)
        print("TOTAL EXPENSE =", total_expense)
        print("MONTHLY REMAINING BUDGET =", monthly_remaining_budget)

        return Response({
            "month": month,
            "year": year,
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "current_balance": float(
                total_income - total_expense
            ),
            "total_savings": float(total_savings),
            "remaining_budget": float(
                monthly_remaining_budget
            ),
        })
class ExpenseReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        from datetime import date, timedelta

        filter_type = request.GET.get("filter")
        month = request.GET.get("month")
        year = request.GET.get("year")

        today = date.today()

        expenses = Expense.objects.filter(
            user=request.user
        )

        # 1. Month + Year filter
        if month and year:

            expenses = expenses.filter(
                expense_date__month=month,
                expense_date__year=year,
            )

        # 2. Current month filter
        elif filter_type == "current_month":

            start_date = today.replace(day=1)
            end_date = today

            expenses = expenses.filter(
                expense_date__gte=start_date,
                expense_date__lte=end_date,
            )

        # 3. Previous month filter
        elif filter_type == "previous_month":

            first_day_current = today.replace(day=1)

            end_date = first_day_current - timedelta(days=1)

            start_date = end_date.replace(day=1)

            expenses = expenses.filter(
                expense_date__gte=start_date,
                expense_date__lte=end_date,
            )

        # 4. Custom date range
        else:

            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")

            if start_date:
                expenses = expenses.filter(
                    expense_date__gte=start_date
                )

            if end_date:
                expenses = expenses.filter(
                    expense_date__lte=end_date
                )

        data = []

        for expense in expenses:

            data.append({
                "title": expense.title,
                "category": expense.category,
                "amount": float(expense.amount),
                "date": expense.expense_date,
                "description": expense.description,
            })

        return Response(data)
class FinancialSummaryReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Financial Summary
        total_income = (
            Income.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )

        total_expense = (
            Expense.objects.filter(user=request.user)
            .aggregate(total=Sum("amount"))["total"] or Decimal("0")
        )

        total_budget = (
            Budget.objects.filter(user=request.user)
            .aggregate(total=Sum("budget_amount"))["total"] or Decimal("0")
        )

        total_savings = (
            SavingsGoal.objects.filter(user=request.user)
            .aggregate(total=Sum("saved_amount"))["total"] or Decimal("0")
        )

        remaining_budget = (
    total_budget - total_expense
)

        financial_summary = {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "current_balance": float(total_income-total_expense),
            "remaining_budget": float(total_budget - total_expense),
            "total_savings": float(total_savings),
}

        # Expense Summary
        expense_summary = list(
            Expense.objects.filter(user=request.user)
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        # Income Summary
        income_summary = list(
            Income.objects.filter(user=request.user)
            .values("source")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        # Budget Summary
        budgets = Budget.objects.filter(
    user=request.user
)
        month_map = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}
        budget_summary = []
        total_remaining_budget = Decimal("0")
        for budget in budgets:
            
            month_number = month_map.get(
    budget.month.lower())
            spent = (
    Expense.objects.filter(
        user=request.user,
        category=budget.category,
        expense_date__month=month_number,
        expense_date__year=budget.year,
    )
    .aggregate(total=Sum("amount"))["total"]
    or Decimal("0")
)

            remaining = budget.budget_amount - spent
            total_remaining_budget += remaining


            budget_summary.append({
                "category": budget.category,
                "budget_amount": float(budget.budget_amount),
                "spent_amount": float(spent),
                "remaining_amount": float(remaining),
            })
            financial_summary = {
                "total_income": float(total_income),
                "total_expense": float(total_expense),
                "current_balance": float(total_income - total_expense),
                "remaining_budget": float(total_budget - total_expense),
                "total_savings": float(total_savings),
}

        # Savings Summary
        savings_summary = list(
            SavingsGoal.objects.filter(user=request.user)
            .values(
                "goal_name",
                "target_amount",
                "saved_amount",
                "status",
            )
        )

        # Latest Notifications
        notifications = list(
            Notification.objects.filter(user=request.user)
            .order_by("-created_at")[:5]
            .values(
                "title",
                "message",
                "created_at",
            )
        )

        return Response({

            "financial_summary": financial_summary,

            "expense_summary": expense_summary,

            "income_summary": income_summary,

            "budget_summary": budget_summary,

            "savings_summary": savings_summary,

            "latest_notifications": notifications,

        })
class ExportReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(
            content_type="text/csv"
        )

        response["Content-Disposition"] = (
            'attachment; filename="Financial_Report.csv"'
        )

        writer = csv.writer(response)

        # Header
        writer.writerow([
            "Type",
            "Title / Source / Goal",
            "Category",
            "Amount",
            "Date",
            "Description",
        ])

        # -------------------------
        # EXPENSES
        # -------------------------

        expenses = Expense.objects.filter(
            user=request.user
        )

        for expense in expenses:
            writer.writerow([
                "Expense",
                expense.title,
                expense.category,
                expense.amount,
                expense.expense_date,
                expense.description,
                "",
                "",
                "",
                "",
                "",
                "",
            ])

        # -------------------------
        # INCOME
        # -------------------------

        income = Income.objects.filter(
            user=request.user
        )

        for item in income:
            writer.writerow([
                "Income",
                item.source,
                "",
                item.amount,
                item.income_date,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ])

        # -------------------------
        # SAVINGS
        # -------------------------

        savings = SavingsGoal.objects.filter(
            user=request.user
        )

        for goal in savings:
            writer.writerow([
                "Savings",
                goal.goal_name,
                "",
                "",
                goal.target_date,
                "",
                goal.target_amount,
                goal.saved_amount,
                goal.status,
                "",
                "",
                "",
            ])

        # -------------------------
        # BUDGETS
        # -------------------------

        budgets = Budget.objects.filter(
            user=request.user
        )

        for budget in budgets:
            writer.writerow([
                "Budget",
                "",
                budget.category,
                "",
                "",
                "",
                "",
                "",
                "",
                budget.budget_amount,
                budget.month,
                budget.year,
            ])

        return response
class SavingsReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        savings = SavingsGoal.objects.filter(user=request.user)

        data = []

        for goal in savings:
            data.append({
                "goal_name": goal.goal_name,
                "target_amount": float(goal.target_amount),
                "saved_amount": float(goal.saved_amount),
                "status": goal.status,
                "target_date": goal.target_date,
            })

        return Response(data)