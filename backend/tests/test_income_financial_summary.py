from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from income.models import Income
from users.models import Expense

User = get_user_model()


class FinancialSummaryViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='password123',
        )
        self.other_user = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='password123',
        )

        Income.objects.create(
            user=self.user,
            title='Salary',
            amount=Decimal('1500.00'),
            category=Income.Category.SALARY,
            description='Monthly salary',
            income_date='2024-01-01',
        )
        Income.objects.create(
            user=self.other_user,
            title='Pocket money',
            amount=Decimal('200.00'),
            category=Income.Category.POCKET_MONEY,
            description='Ignored for other user',
            income_date='2024-01-02',
        )

        Expense.objects.create(
            user=self.user,
            title='Groceries',
            amount=Decimal('300.00'),
            category=Expense.Category.FOOD,
            description='Food expenses',
            expense_date='2024-01-03',
        )
        Expense.objects.create(
            user=self.other_user,
            title='Taxi',
            amount=Decimal('80.00'),
            category=Expense.Category.TRAVEL,
            description='Ignored for other user',
            expense_date='2024-01-04',
        )

    def test_summary_returns_only_authenticated_users_financial_metrics(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse('financial-summary'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {'total_income': 1500.0, 'total_expense': 300.0, 'balance': 1200.0},
        )
