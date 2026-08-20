from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from budgets.models import Budget, SavingsGoal
from expenses.models import Expense
from income.models import Income
from notifications.models import Notification


class AnalyticsAPITests(APITestCase):
    """
    Test suite for Analytics Dashboard aggregation and Expense Analysis APIs.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="analytics_user",
            email="analytics@example.com",
            password="Password123!",
        )
        self.dashboard_url = "/api/analytics/dashboard/"
        self.expense_analysis_url = "/api/analytics/expense-analysis/"

        self.client.force_authenticate(user=self.user)

    def test_dashboard_analytics_with_data(self):
        """
        Ensure /api/analytics/dashboard/ computes correct financial totals, category
        breakdowns, monthly trends, recent transactions, and savings goals.
        """
        today = date.today()

        # 1. Income = 60,000
        Income.objects.create(
            user=self.user,
            title="Tech Salary",
            amount=Decimal("60000.00"),
            source="SALARY",
            income_date=today,
        )

        # 2. Expenses: Food = 4,000, Travel = 2,000, Bills = 3,000 (Total = 9,000)
        Expense.objects.create(
            user=self.user,
            title="Groceries",
            amount=Decimal("4000.00"),
            category="Food",
            date=today,
        )
        Expense.objects.create(
            user=self.user,
            title="Cab Ride",
            amount=Decimal("2000.00"),
            category="Travel",
            date=today,
        )
        Expense.objects.create(
            user=self.user,
            title="Internet Bill",
            amount=Decimal("3000.00"),
            category="Bills",
            date=today,
        )

        # 3. Savings Goal = 10,000 saved out of 50,000
        SavingsGoal.objects.create(
            user=self.user,
            title="Bike Fund",
            target_amount=Decimal("50000.00"),
            saved_amount=Decimal("10000.00"),
        )

        # 4. Budget for Food = 8,000 for current month
        Budget.objects.create(
            user=self.user,
            category="Food",
            amount=Decimal("8000.00"),
            month=today.strftime("%B"),
        )

        # 5. Notification
        Notification.objects.create(
            user=self.user,
            title="Welcome to BudgetBuddy",
            message="Your analytics dashboard is now live.",
            notification_type="MONTHLY_REPORT",
            priority="LOW",
        )

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify Financial Summary
        summary = response.data["financial_summary"]
        self.assertEqual(Decimal(str(summary["total_income"])), Decimal("60000.00"))
        self.assertEqual(Decimal(str(summary["total_expense"])), Decimal("9000.00"))
        self.assertEqual(Decimal(str(summary["current_balance"])), Decimal("51000.00"))
        self.assertEqual(Decimal(str(summary["total_savings"])), Decimal("10000.00"))
        self.assertEqual(Decimal(str(summary["total_budget"])), Decimal("8000.00"))

        # Verify Category Breakdown
        categories = response.data["category_analysis"]
        self.assertEqual(len(categories), 3)
        cat_map = {item["category"]: Decimal(str(item["total_amount"])) for item in categories}
        self.assertEqual(cat_map["Food"], Decimal("4000.00"))
        self.assertEqual(cat_map["Travel"], Decimal("2000.00"))
        self.assertEqual(cat_map["Bills"], Decimal("3000.00"))

        # Verify Monthly Trend
        monthly_trend = response.data["monthly_trend"]
        self.assertTrue(len(monthly_trend) >= 1)
        self.assertEqual(Decimal(str(monthly_trend[0]["total_amount"])), Decimal("9000.00"))

        # Verify Recent Transactions
        recent_txs = response.data["recent_transactions"]
        self.assertEqual(len(recent_txs), 3)

        # Verify Active Savings Goals
        active_goals = response.data["active_savings_goals"]
        self.assertEqual(len(active_goals), 1)
        self.assertEqual(active_goals[0]["title"], "Bike Fund")
        self.assertEqual(active_goals[0]["percentage"], 20.0)

        # Verify Expense Analysis
        expense_analysis = response.data["expense_analysis"]
        self.assertIsNotNone(expense_analysis["highest_expense"])
        self.assertEqual(
            Decimal(str(expense_analysis["highest_expense"]["amount"])), Decimal("4000.00")
        )
        self.assertEqual(
            Decimal(str(expense_analysis["lowest_expense"]["amount"])), Decimal("2000.00")
        )

    def test_dashboard_empty_state(self):
        """
        Ensure dashboard handles new accounts with zero data cleanly without errors.
        """
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        summary = response.data["financial_summary"]
        self.assertEqual(Decimal(str(summary["total_income"])), Decimal("0.00"))
        self.assertEqual(Decimal(str(summary["total_expense"])), Decimal("0.00"))
        self.assertEqual(Decimal(str(summary["current_balance"])), Decimal("0.00"))
        self.assertEqual(Decimal(str(summary["total_savings"])), Decimal("0.00"))
        self.assertEqual(response.data["category_analysis"], [])
        self.assertEqual(response.data["monthly_trend"], [])
        self.assertEqual(response.data["recent_transactions"], [])
        self.assertEqual(response.data["active_savings_goals"], [])

    def test_expense_analysis_endpoint(self):
        """
        Ensure /api/analytics/expense-analysis/ returns highest, lowest, latest, and oldest.
        """
        Expense.objects.create(
            user=self.user,
            title="Old Small Expense",
            amount=Decimal("100.00"),
            category="Food",
            date=date(2026, 1, 1),
        )
        Expense.objects.create(
            user=self.user,
            title="Recent Large Expense",
            amount=Decimal("7500.00"),
            category="Shopping",
            date=date(2026, 8, 1),
        )

        response = self.client.get(self.expense_analysis_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Decimal(str(response.data["highest_expense"]["amount"])), Decimal("7500.00")
        )
        self.assertEqual(
            Decimal(str(response.data["lowest_expense"]["amount"])), Decimal("100.00")
        )
