from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from income.models import Income
from expenses.models import Expense
from rest_framework import status
import datetime

class IncomeAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.other_user = User.objects.create_user(username='otheruser', password='password123')
        
        self.client.force_authenticate(user=self.user)
        
        self.income = Income.objects.create(
            user=self.user,
            title='Monthly salary',
            amount=5000.00,
            source='SALARY',
            description='Main paycheck',
            income_date=datetime.date(2026, 7, 1)
        )

    def test_create_income_valid(self):
        data = {
            'title': 'Tutoring',
            'amount': '150.00',
            'source': 'FREELANCING',
            'description': 'Math classes',
            'income_date': '2026-07-15'
        }
        response = self.client.post('/api/income/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Tutoring')
        self.assertEqual(response.data['source'], 'FREELANCING')

    def test_create_income_invalid_source(self):
        data = {
            'title': 'Cash gift',
            'amount': '50.00',
            'source': 'INVALID_SOURCE',
            'income_date': '2026-07-15'
        }
        response = self.client.post('/api/income/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_all_income(self):
        response = self.client.get('/api/income/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_income(self):
        data = {
            'title': 'Salary updated',
            'amount': '5500.00',
            'source': 'SALARY',
            'income_date': '2026-07-01'
        }
        response = self.client.put(f'/api/income/{self.income.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Salary updated')
        self.assertEqual(float(response.data['amount']), 5500.00)

    def test_delete_income(self):
        response = self.client.delete(f'/api/income/{self.income.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Income.objects.filter(id=self.income.id).count(), 0)

    def test_summary_api(self):
        # Create an expense
        Expense.objects.create(
            user=self.user,
            category='FOOD',
            amount=200.00,
            date=datetime.date(2026, 7, 2)
        )
        
        response = self.client.get('/api/income/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_income'], 5000.00)
        self.assertEqual(response.data['total_expense'], 200.00)
        self.assertEqual(response.data['current_balance'], 4800.00)

    def test_unauthenticated_access_denied(self):
        self.client.force_authenticate(user=None)
        
        response = self.client.get('/api/income/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get('/api/income/summary/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
