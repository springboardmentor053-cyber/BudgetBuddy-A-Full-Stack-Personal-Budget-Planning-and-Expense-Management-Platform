from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from budgets.models import Budget, SavingsGoal
from expenses.models import Expense
from notifications.models import Notification


class BudgetAPITests(APITestCase):
    """
    Test suite for Budget CRUD operations, unique constraints, summary calculations,
    and alert thresholds.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="budget_user",
            email="budget@example.com",
            password="Password123!",
        )
        self.budget_list_url = reverse("budget-list")
        self.budget_summary_url = reverse("budget-summary")
        self.budget_alert_url = reverse("budget-alert")

        self.client.force_authenticate(user=self.user)

    def test_create_budget_and_notification(self):
        """
        Ensure user can create a budget and a BUDGET_CREATED notification is generated.
        """
        payload = {
            "category": "Food",
            "amount": "10000.00",
            "month": "August",
        }
        response = self.client.post(self.budget_list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"], "Food")
        self.assertEqual(Decimal(str(response.data["amount"])), Decimal("10000.00"))

        # Verify notification
        notif = Notification.objects.filter(
            user=self.user, notification_type="BUDGET_CREATED"
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn("Food", notif.title)

    def test_duplicate_budget_validation_error(self):
        """
        Ensure creating a second budget for the same user, category, and month is rejected.
        """
        Budget.objects.create(
            user=self.user,
            category="Travel",
            amount=Decimal("5000.00"),
            month="August",
        )

        payload = {
            "category": "Travel",
            "amount": "6000.00",
            "month": "August",
        }
        response = self.client.post(self.budget_list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_budget_summary_calculations(self):
        """
        Ensure /api/budgets/budget-summary/ calculates total budget, spent amount,
        remaining balance, and utilization percentages correctly.
        """
        # Create budget for Food = 10,000 for August 2026
        budget = Budget.objects.create(
            user=self.user,
            category="Food",
            amount=Decimal("10000.00"),
            month="August",
        )

        # Create expense for Food = 4,000 in August 2026
        Expense.objects.create(
            user=self.user,
            title="Supermarket",
            amount=Decimal("4000.00"),
            category="Food",
            date=date(2026, 8, 5),
        )

        response = self.client.get(self.budget_summary_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["total_budget"])), Decimal("10000.00"))
        self.assertEqual(Decimal(str(response.data["total_spent"])), Decimal("4000.00"))
        self.assertEqual(Decimal(str(response.data["total_remaining"])), Decimal("6000.00"))

        budgets_list = response.data["budgets"]
        self.assertEqual(len(budgets_list), 1)
        self.assertEqual(budgets_list[0]["category"], "Food")
        self.assertEqual(budgets_list[0]["percentage_used"], 40.0)
        self.assertEqual(budgets_list[0]["status"], "Within Budget")

    def test_budget_alert_thresholds(self):
        """
        Ensure /api/budgets/budget-alert/ correctly reports NORMAL, WARNING, HIGH, and EXCEEDED states.
        """
        Budget.objects.create(
            user=self.user,
            category="Shopping",
            amount=Decimal("1000.00"),
            month="August",
        )

        # 1. Normal state (<80%): Expense = 500
        e1 = Expense.objects.create(
            user=self.user,
            title="Shirt",
            amount=Decimal("500.00"),
            category="Shopping",
            date=date(2026, 8, 2),
        )
        response = self.client.get(f"{self.budget_alert_url}?category=Shopping&month=August")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["alert_level"], "NORMAL")

        # 2. Warning state (>=80% and <90%): Add 320 -> Total 820 (82%)
        e2 = Expense.objects.create(
            user=self.user,
            title="Shoes",
            amount=Decimal("320.00"),
            category="Shopping",
            date=date(2026, 8, 4),
        )
        response = self.client.get(f"{self.budget_alert_url}?category=Shopping&month=August")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["alert_level"], "WARNING")

        # 3. High state (>=90% and <100%): Add 100 -> Total 920 (92%)
        e3 = Expense.objects.create(
            user=self.user,
            title="Hat",
            amount=Decimal("100.00"),
            category="Shopping",
            date=date(2026, 8, 6),
        )
        response = self.client.get(f"{self.budget_alert_url}?category=Shopping&month=August")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["alert_level"], "HIGH")

        # 4. Exceeded state (>=100%): Add 150 -> Total 1070 (107%)
        e4 = Expense.objects.create(
            user=self.user,
            title="Watch",
            amount=Decimal("150.00"),
            category="Shopping",
            date=date(2026, 8, 8),
        )
        response = self.client.get(f"{self.budget_alert_url}?category=Shopping&month=August")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["alert_level"], "EXCEEDED")


class SavingsGoalAPITests(APITestCase):
    """
    Test suite for Savings Goal CRUD, progress calculation, and completion notifications.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="savings_user",
            email="savings@example.com",
            password="Password123!",
        )
        self.list_url = reverse("savings-goal-list")
        self.client.force_authenticate(user=self.user)

    def test_create_savings_goal_and_notification(self):
        """
        Ensure creating a savings goal calculates progress percentage and creates notification.
        """
        payload = {
            "title": "Emergency Fund",
            "target_amount": "50000.00",
            "saved_amount": "10000.00",
            "target_date": "2026-12-31",
            "description": "6 months living expenses",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Emergency Fund")
        self.assertEqual(Decimal(str(response.data["target_amount"])), Decimal("50000.00"))
        self.assertEqual(Decimal(str(response.data["saved_amount"])), Decimal("10000.00"))
        self.assertEqual(response.data["progress_percentage"], 20.0)
        self.assertEqual(Decimal(str(response.data["remaining_amount"])), Decimal("40000.00"))

        # Check creation notification
        notif = Notification.objects.filter(
            user=self.user, notification_type="SAVINGS_GOAL_CREATED"
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn("Emergency Fund", notif.title)

    def test_savings_goal_completion_trigger(self):
        """
        Ensure updating saved_amount to reach or exceed target_amount triggers GOAL_COMPLETED notification.
        """
        goal = SavingsGoal.objects.create(
            user=self.user,
            title="Laptop Upgrade",
            target_amount=Decimal("60000.00"),
            saved_amount=Decimal("40000.00"),
            target_date=date(2026, 11, 30),
        )

        detail_url = reverse("savings-goal-detail", kwargs={"pk": goal.id})

        # Update saved_amount to 60,000 (100% complete)
        payload = {
            "title": "Laptop Upgrade",
            "target_amount": "60000.00",
            "saved_amount": "60000.00",
            "target_date": "2026-11-30",
        }
        response = self.client.put(detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that GOAL_COMPLETED notification was created
        completion_notif = Notification.objects.filter(
            user=self.user, notification_type="GOAL_COMPLETED"
        ).first()
        self.assertIsNotNone(completion_notif)
        self.assertIn("Laptop Upgrade", completion_notif.title)
        self.assertEqual(completion_notif.priority, "HIGH")

    def test_delete_savings_goal(self):
        """
        Ensure user can delete a savings goal.
        """
        goal = SavingsGoal.objects.create(
            user=self.user,
            title="Vacation",
            target_amount=Decimal("20000.00"),
            saved_amount=Decimal("5000.00"),
        )
        detail_url = reverse("savings-goal-detail", kwargs={"pk": goal.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SavingsGoal.objects.filter(id=goal.id).exists())
