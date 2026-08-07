from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase

from budgets.models import Budget
from budgets.services import check_and_trigger_budget_alerts
from budgets.utils import calculate_budget_utilization
from expenses.models import Expense
from notifications.models import Notification


class BudgetAlertSystemTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.budget = Budget.objects.create(
            user=self.user,
            category="Food",
            monthly_limit=10000,
            month=8,
            year=2026
        )

    def test_1_under_threshold(self):
        Expense.objects.create(
            user=self.user,
            title="Dinner",
            category="Food",
            amount=3000,
            expense_date=date(2026, 8, 1)
        )

        # Call only if you're NOT using signals
        # check_and_trigger_budget_alerts(self.user, "Food", 8, 2026)

        _, total_expense, utilization = calculate_budget_utilization(
            self.user,
            "Food",
            8,
            2026
        )

        self.assertEqual(total_expense, 3000)
        self.assertEqual(utilization, 30.0)

        self.assertEqual(
            Notification.objects.filter(user=self.user).count(),
            0
        )

    def test_2_warning_80_percent(self):

        Expense.objects.create(
            user=self.user,
            title="Groceries",
            category="Food",
            amount=8000,
            expense_date=date(2026, 8, 1)
        )

        # check_and_trigger_budget_alerts(self.user, "Food", 8, 2026)

        self.budget.refresh_from_db()

        self.assertTrue(self.budget.warning_80_sent)
        self.assertFalse(self.budget.warning_90_sent)
        self.assertFalse(self.budget.warning_100_sent)

        self.assertEqual(
            Notification.objects.filter(
                user=self.user,
                priority="MEDIUM"
            ).count(),
            1
        )

    def test_3_high_alert_90_percent(self):

        Expense.objects.create(
            user=self.user,
            title="Restocking",
            category="Food",
            amount=9000,
            expense_date=date(2026, 8, 1)
        )

        # check_and_trigger_budget_alerts(self.user, "Food", 8, 2026)

        self.budget.refresh_from_db()

        self.assertTrue(self.budget.warning_80_sent)
        self.assertTrue(self.budget.warning_90_sent)
        self.assertFalse(self.budget.warning_100_sent)

        self.assertEqual(
            Notification.objects.filter(
                user=self.user,
                priority="HIGH"
            ).count(),
            1
        )

    def test_4_budget_exceeded_100_percent(self):

        Expense.objects.create(
            user=self.user,
            title="Big Party",
            category="Food",
            amount=10500,
            expense_date=date(2026, 8, 1)
        )

        # check_and_trigger_budget_alerts(self.user, "Food", 8, 2026)

        self.budget.refresh_from_db()

        self.assertTrue(self.budget.warning_80_sent)
        self.assertTrue(self.budget.warning_90_sent)
        self.assertTrue(self.budget.warning_100_sent)

        self.assertEqual(
            Notification.objects.filter(
                user=self.user,
                priority="CRITICAL"
            ).count(),
            1
        )

    def test_5_no_duplicate_notifications(self):

        expense = Expense.objects.create(
            user=self.user,
            title="Initial",
            category="Food",
            amount=10500,
            expense_date=date(2026, 8, 1)
        )

        # check_and_trigger_budget_alerts(self.user, "Food", 8, 2026)

        initial_count = Notification.objects.filter(
            user=self.user
        ).count()

        expense.amount = 10600
        expense.save()

        # check_and_trigger_budget_alerts(self.user, "Food", 8, 2026)

        updated_count = Notification.objects.filter(
            user=self.user
        ).count()

        self.assertEqual(initial_count, updated_count)

    def test_6_reset_for_next_month(self):

        september_budget = Budget.objects.create(
            user=self.user,
            category="Food",
            monthly_limit=10000,
            month=9,
            year=2026
        )

        self.assertFalse(september_budget.warning_80_sent)
        self.assertFalse(september_budget.warning_90_sent)
        self.assertFalse(september_budget.warning_100_sent)

        Expense.objects.create(
            user=self.user,
            title="September Expense",
            category="Food",
            amount=8000,
            expense_date=date(2026, 9, 1)
        )

        # check_and_trigger_budget_alerts(self.user, "Food", 9, 2026)

        september_budget.refresh_from_db()

        self.assertTrue(september_budget.warning_80_sent)

        self.assertEqual(
            Notification.objects.filter(
                user=self.user,
                priority="MEDIUM"
            ).count(),
            1
        )
