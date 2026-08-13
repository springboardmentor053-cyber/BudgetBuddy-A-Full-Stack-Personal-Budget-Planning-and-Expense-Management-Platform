from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from budgets.models import Budget
from notifications.models import Notification


class BudgetAlertEndpointTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='alert-user', password='StrongPass123')
        self.client.force_authenticate(self.user)
        today = date.today()
        Budget.objects.create(user=self.user, category='FOOD', budget_amount='100.00', month=today.month, year=today.year)
        self.payload = {
            'title': 'Groceries', 'amount': '80.00', 'category': 'FOOD',
            'description': '', 'expense_date': today.isoformat(),
        }

    def test_creating_expense_creates_an_80_percent_budget_notification(self):
        response = self.client.post('/api/expenses/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Expense created successfully')
        notification = Notification.objects.get(user=self.user, title='\u26A0\uFE0F Budget Alert (80%): FOOD')
        self.assertEqual(notification.priority, 'MEDIUM')
        self.assertIn('80.0%', notification.message)

    def test_update_only_alerts_when_entering_a_higher_tier(self):
        response = self.client.post('/api/expenses/', self.payload, format='json')
        expense_id = response.data['expense']['id']
        response = self.client.put(f'/api/expenses/{expense_id}/', {**self.payload, 'amount': '95.00'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['budget_alert']['level'], 'critical_90')
        self.assertEqual(Notification.objects.filter(user=self.user, notification_type='BUDGET_ALERT').exclude(title='New Budget Created').count(), 2)
