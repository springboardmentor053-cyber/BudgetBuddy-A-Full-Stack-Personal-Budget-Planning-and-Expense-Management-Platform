from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from budgets.models import Budget
from expenses.models import Expense
from notifications.models import Notification


class ExpenseAPITests(APITestCase):
    """
    Test suite for Expense CRUD operations, user isolation, sorting, filtering,
    totals, insights, and budget alert triggers.
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            email="user1@example.com",
            password="Password123!",
        )
        self.user2 = User.objects.create_user(
            username="user2",
            email="user2@example.com",
            password="Password123!",
        )

        self.list_url = reverse("expense-list")
        self.total_url = reverse("expense-total")
        self.insights_url = reverse("expense-insights")

        # Create initial expenses for user1
        self.expense1 = Expense.objects.create(
            user=self.user1,
            title="Groceries",
            amount=Decimal("1500.00"),
            category="Food",
            date=date(2026, 8, 1),
            description="Weekly grocery shopping",
        )
        self.expense2 = Expense.objects.create(
            user=self.user1,
            title="Bus Pass",
            amount=Decimal("500.00"),
            category="Travel",
            date=date(2026, 8, 5),
            description="Monthly transit pass",
        )

        # Create expense for user2 (for isolation testing)
        self.expense_user2 = Expense.objects.create(
            user=self.user2,
            title="User2 Expense",
            amount=Decimal("3000.00"),
            category="Shopping",
            date=date(2026, 8, 10),
            description="Private expense",
        )

        self.client.force_authenticate(user=self.user1)

    def test_list_expenses_user_isolation(self):
        """
        Ensure user only sees their own expenses and not expenses of other users.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertEqual(len(data), 2)
        titles = [item["title"] for item in data]
        self.assertIn("Groceries", titles)
        self.assertIn("Bus Pass", titles)
        self.assertNotIn("User2 Expense", titles)

    def test_create_expense_success(self):
        """
        Ensure user can create an expense with valid payload.
        """
        payload = {
            "title": "Electricity Bill",
            "amount": "1200.50",
            "category": "Bills",
            "date": "2026-08-15",
            "description": "Monthly power bill",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Electricity Bill")
        self.assertEqual(Decimal(str(response.data["amount"])), Decimal("1200.50"))
        self.assertEqual(response.data["category"], "Bills")

        # Check in database
        self.assertTrue(
            Expense.objects.filter(user=self.user1, title="Electricity Bill").exists()
        )

    def test_create_expense_validation_error(self):
        """
        Ensure creating expense fails when required fields are missing.
        """
        # Missing title and amount
        payload = {
            "category": "Utilities",
            "date": "2026-08-15",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)
        self.assertIn("amount", response.data)

    def test_filter_expenses_by_category(self):
        """
        Ensure filtering expenses by ?category=Food returns only Food expenses.
        """
        response = self.client.get(f"{self.list_url}?category=Food")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["category"], "Food")

    def test_sort_expenses(self):
        """
        Ensure sorting by highest, lowest, latest, and oldest works accurately.
        """
        # Sort highest
        response = self.client.get(f"{self.list_url}?sort=highest")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertEqual(Decimal(str(data[0]["amount"])), Decimal("1500.00"))

        # Sort lowest
        response = self.client.get(f"{self.list_url}?sort=lowest")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertEqual(Decimal(str(data[0]["amount"])), Decimal("500.00"))

    def test_retrieve_expense_detail(self):
        """
        Ensure user can retrieve single expense by ID.
        """
        detail_url = reverse("expense-detail", kwargs={"pk": self.expense1.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Groceries")

    def test_cannot_retrieve_other_user_expense(self):
        """
        Ensure user cannot access another user's expense (returns 404).
        """
        detail_url = reverse("expense-detail", kwargs={"pk": self.expense_user2.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_expense(self):
        """
        Ensure user can update their expense.
        """
        detail_url = reverse("expense-detail", kwargs={"pk": self.expense1.id})
        payload = {
            "title": "Supermarket Groceries",
            "amount": "1800.00",
            "category": "Food",
            "date": "2026-08-01",
            "description": "Updated grocery run",
        }
        response = self.client.put(detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.expense1.refresh_from_db()
        self.assertEqual(self.expense1.title, "Supermarket Groceries")
        self.assertEqual(self.expense1.amount, Decimal("1800.00"))

    def test_delete_expense(self):
        """
        Ensure user can delete their expense.
        """
        detail_url = reverse("expense-detail", kwargs={"pk": self.expense2.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=self.expense2.id).exists())

    def test_expense_total_endpoint(self):
        """
        Ensure /api/expenses/expenses/total/ aggregates total expense for user.
        """
        response = self.client.get(self.total_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["total_expense"])), Decimal("2000.00"))

    def test_expense_insights_endpoint(self):
        """
        Ensure /api/expenses/expenses/insights/ returns highest, lowest, latest, oldest expenses.
        """
        response = self.client.get(self.insights_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("highest_expense", response.data)
        self.assertIn("lowest_expense", response.data)
        self.assertIn("latest_expense", response.data)
        self.assertIn("oldest_expense", response.data)

        self.assertEqual(
            Decimal(str(response.data["highest_expense"]["amount"])),
            Decimal("1500.00"),
        )
        self.assertEqual(
            Decimal(str(response.data["lowest_expense"]["amount"])),
            Decimal("500.00"),
        )

    def test_expense_triggers_budget_alert(self):
        """
        Ensure creating an expense that exceeds budget thresholds automatically triggers a notification.
        """
        # Create a budget for Food of 2000 for August 2026
        Budget.objects.create(
            user=self.user1,
            category="Food",
            amount=Decimal("2000.00"),
            month="August",
        )

        # Expense1 was 1500 (75%). Adding 400 makes total 1900 (95% -> HIGH alert)
        payload = {
            "title": "Dinner Out",
            "amount": "400.00",
            "category": "Food",
            "date": "2026-08-10",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify a notification was created
        notifications = Notification.objects.filter(user=self.user1)
        self.assertTrue(notifications.exists())
        alert_titles = [n.title for n in notifications]
        self.assertTrue(any("Budget Alert" in t or "Food" in t for t in alert_titles))
