from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from income.models import Income


class IncomeAPITests(APITestCase):
    """
    Test suite for Income CRUD operations, validation, ordering, and user isolation.
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="income_user1",
            email="income1@example.com",
            password="Password123!",
        )
        self.user2 = User.objects.create_user(
            username="income_user2",
            email="income2@example.com",
            password="Password123!",
        )

        self.list_url = reverse("income-list")

        # Initial income records for user1
        self.income1 = Income.objects.create(
            user=self.user1,
            title="Monthly Salary",
            amount=Decimal("50000.00"),
            source="SALARY",
            income_date=date(2026, 8, 1),
            description="August tech company salary",
        )
        self.income2 = Income.objects.create(
            user=self.user1,
            title="Freelance Project",
            amount=Decimal("15000.00"),
            source="FREELANCING",
            income_date=date(2026, 8, 10),
            description="Web design gig",
        )

        # Income record for user2
        self.income_user2 = Income.objects.create(
            user=self.user2,
            title="User 2 Scholarship",
            amount=Decimal("8000.00"),
            source="SCHOLARSHIP",
            income_date=date(2026, 8, 3),
            description="Private stipend",
        )

        self.client.force_authenticate(user=self.user1)

    def test_list_income_user_isolation(self):
        """
        Ensure user only retrieves their own income records and never other users' income.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertEqual(len(data), 2)
        titles = [item["title"] for item in data]
        self.assertIn("Monthly Salary", titles)
        self.assertIn("Freelance Project", titles)
        self.assertNotIn("User 2 Scholarship", titles)

    def test_create_income_success(self):
        """
        Ensure user can create a new income entry with valid attributes.
        """
        payload = {
            "title": "Stock Dividends",
            "amount": "2500.00",
            "source": "BUSINESS",
            "income_date": "2026-08-15",
            "description": "Quarterly dividend payment",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Stock Dividends")
        self.assertEqual(Decimal(str(response.data["amount"])), Decimal("2500.00"))
        self.assertEqual(response.data["source"], "BUSINESS")

        self.assertTrue(
            Income.objects.filter(user=self.user1, title="Stock Dividends").exists()
        )

    def test_create_income_validation_errors(self):
        """
        Ensure validation errors are returned for missing title or non-positive amount.
        """
        # Missing title and negative amount
        payload = {
            "title": "   ",
            "amount": "-500.00",
            "source": "SALARY",
            "income_date": "2026-08-15",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

        # Amount <= 0
        payload2 = {
            "title": "Zero Income",
            "amount": "0.00",
            "source": "OTHER",
            "income_date": "2026-08-15",
        }
        response2 = self.client.post(self.list_url, payload2, format="json")
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("amount", response2.data)

    def test_retrieve_income_detail(self):
        """
        Ensure user can retrieve a single income record by ID.
        """
        detail_url = reverse("income-detail", kwargs={"pk": self.income1.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Monthly Salary")
        self.assertEqual(Decimal(str(response.data["amount"])), Decimal("50000.00"))

    def test_cannot_retrieve_other_user_income(self):
        """
        Ensure user cannot retrieve an income record belonging to another user.
        """
        detail_url = reverse("income-detail", kwargs={"pk": self.income_user2.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_income(self):
        """
        Ensure user can update their existing income record.
        """
        detail_url = reverse("income-detail", kwargs={"pk": self.income1.id})
        payload = {
            "title": "Updated Salary with Bonus",
            "amount": "55000.00",
            "source": "SALARY",
            "income_date": "2026-08-01",
            "description": "Base salary + performance bonus",
        }
        response = self.client.put(detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.income1.refresh_from_db()
        self.assertEqual(self.income1.title, "Updated Salary with Bonus")
        self.assertEqual(self.income1.amount, Decimal("55000.00"))

    def test_delete_income(self):
        """
        Ensure user can delete an income record.
        """
        detail_url = reverse("income-detail", kwargs={"pk": self.income2.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Income.objects.filter(id=self.income2.id).exists())
