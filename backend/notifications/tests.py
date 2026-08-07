from django.contrib.auth.models import User
from django.test import TestCase

from expenses.models import Expense
from income.models import Income
from notifications.models import Notification


class NotificationSignalsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='tester',
            email='tester@example.com',
            password='secret123',
        )

    def test_expense_creation_creates_notification(self):
        Expense.objects.create(
            user=self.user,
            title='Groceries',
            amount='25.50',
            category='FOOD',
        )

        notification = Notification.objects.filter(
            user=self.user,
            notification_type='EXPENSE_CREATED',
        ).order_by('-created_at').first()

        self.assertIsNotNone(notification)
        self.assertIn('Expense', notification.title)
        self.assertIn('Groceries', notification.message)

    def test_income_creation_creates_notification(self):
        Income.objects.create(
            user=self.user,
            title='Salary',
            amount='1500.00',
            source='SALARY',
            description='Monthly salary',
            income_date='2026-08-01',
        )

        notification = Notification.objects.filter(
            user=self.user,
            notification_type='INCOME_CREATED',
        ).order_by('-created_at').first()

        self.assertIsNotNone(notification)
        self.assertIn('Income', notification.title)
        self.assertIn('Salary', notification.message)
