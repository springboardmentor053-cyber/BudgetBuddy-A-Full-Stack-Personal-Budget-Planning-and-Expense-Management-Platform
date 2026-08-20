from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from budgets.models import Budget, SavingsGoal
from expenses.models import Expense
from income.models import Income


class ReportsAPITests(APITestCase):
    """
    Test suite for Financial Reports, Monthly Trends, Category Analysis,
    Income vs Expense Comparison, Savings Summary, and PDF Report Generation.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="reports_user",
            email="reports@example.com",
            password="Password123!",
        )

        self.financial_summary_url = reverse("financial-summary")
        self.monthly_trend_url = reverse("monthly-expense-trend")
        self.category_expenses_url = reverse("category-expenses")
        self.income_vs_expense_url = reverse("income-vs-expense")
        self.savings_report_url = reverse("savings-report")
        self.monthly_report_url = reverse("monthly-report")
        self.download_pdf_url = reverse("download-pdf-report")

        # Setup test data for August 2026
        # Income = 70,000
        Income.objects.create(
            user=self.user,
            title="August Salary",
            amount=Decimal("70000.00"),
            source="SALARY",
            income_date=date(2026, 8, 1),
        )

        # Expenses = 5,000 (Food) + 2,500 (Bills) = 7,500
        Expense.objects.create(
            user=self.user,
            title="Groceries",
            amount=Decimal("5000.00"),
            category="Food",
            date=date(2026, 8, 5),
        )
        Expense.objects.create(
            user=self.user,
            title="Electric Bill",
            amount=Decimal("2500.00"),
            category="Bills",
            date=date(2026, 8, 10),
        )

        # Budget = 10,000 for August 2026
        Budget.objects.create(
            user=self.user,
            category="Food",
            amount=Decimal("10000.00"),
            month="August 2026",
        )

        # Savings Goal = 25,000 saved out of 100,000 (25%)
        SavingsGoal.objects.create(
            user=self.user,
            title="Emergency Fund",
            target_amount=Decimal("100000.00"),
            saved_amount=Decimal("25000.00"),
            target_date=date(2026, 12, 31),
        )

        self.client.force_authenticate(user=self.user)

    def test_financial_summary_report(self):
        """
        Ensure /api/reports/financial-summary/ calculates all-time income, expense, and balance.
        """
        response = self.client.get(self.financial_summary_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["total_income"])), Decimal("70000.00"))
        self.assertEqual(Decimal(str(response.data["total_expense"])), Decimal("7500.00"))
        self.assertEqual(Decimal(str(response.data["current_balance"])), Decimal("62500.00"))

    def test_monthly_expense_trend(self):
        """
        Ensure /api/reports/monthly-expense-trend/?year=2026 returns 12 months with correct totals.
        """
        response = self.client.get(f"{self.monthly_trend_url}?year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["year"], 2026)

        monthly_expenses = response.data["monthly_expenses"]
        self.assertEqual(len(monthly_expenses), 12)

        august_data = next((m for m in monthly_expenses if m.get("month") == "August"), None)
        self.assertIsNotNone(august_data)
        self.assertEqual(Decimal(str(august_data["total_expense"])), Decimal("7500.00"))

    def test_category_expenses_report(self):
        """
        Ensure /api/reports/category-expenses/?month=8&year=2026 returns category breakdown.
        """
        response = self.client.get(f"{self.category_expenses_url}?month=8&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["total_expense"])), Decimal("7500.00"))

        categories = response.data["categories"]
        cat_map = {item["category"]: Decimal(str(item["amount"])) for item in categories}
        self.assertEqual(cat_map["Food"], Decimal("5000.00"))
        self.assertEqual(cat_map["Bills"], Decimal("2500.00"))

    def test_income_vs_expense_comparison(self):
        """
        Ensure /api/reports/income-vs-expense/?month=8&year=2026 returns comparison and surplus status.
        """
        response = self.client.get(f"{self.income_vs_expense_url}?month=8&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["total_income"])), Decimal("70000.00"))
        self.assertEqual(Decimal(str(response.data["total_expense"])), Decimal("7500.00"))
        self.assertEqual(Decimal(str(response.data["balance"])), Decimal("62500.00"))
        self.assertEqual(response.data["status"], "SURPLUS")

    def test_savings_report(self):
        """
        Ensure /api/reports/savings-report/ returns savings goals details and overall progress.
        """
        response = self.client.get(self.savings_report_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["total_saved"])), Decimal("25000.00"))
        self.assertEqual(Decimal(str(response.data["total_target"])), Decimal("100000.00"))
        self.assertEqual(response.data["overall_progress"], 25.0)
        self.assertEqual(len(response.data["goals"]), 1)

    def test_monthly_financial_report(self):
        """
        Ensure /api/reports/monthly-report/?month=8&year=2026 returns complete structured report.
        """
        response = self.client.get(f"{self.monthly_report_url}?month=8&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["month"], "August")
        self.assertEqual(response.data["year"], 2026)
        self.assertEqual(Decimal(str(response.data["income"]["total"])), Decimal("70000.00"))
        self.assertEqual(Decimal(str(response.data["expense"]["total"])), Decimal("7500.00"))
        self.assertEqual(Decimal(str(response.data["balance"])), Decimal("62500.00"))

    def test_download_pdf_report(self):
        """
        Ensure /api/reports/report/pdf/?month=8&year=2026 generates a valid downloadable PDF binary stream.
        """
        response = self.client.get(f"{self.download_pdf_url}?month=8&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn("attachment; filename=", response["Content-Disposition"])
        # Verify valid PDF signature bytes
        self.assertTrue(response.content.startswith(b"%PDF-"))
        self.assertTrue(len(response.content) > 100)
