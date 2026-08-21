from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from budgets.models import Budget
from rest_framework import status
import datetime

class BudgetAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)
        
        self.current_month = datetime.date.today().strftime('%B')
        
        self.budget = Budget.objects.create(
            user=self.user,
            category='FOOD',
            limit_amount=500.00,
            month=self.current_month
        )

    def test_create_budget_valid(self):
        data = {
            'category': 'travel',  # should normalize to TRAVEL
            'limit_amount': '250.00',
            'month': self.current_month.lower()
        }
        response = self.client.post('/api/budgets/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'TRAVEL')
        self.assertEqual(response.data['month'], self.current_month)

    def test_create_budget_duplicate_fails(self):
        # A budget for FOOD in current month already exists from setUp
        data = {
            'category': 'food',
            'limit_amount': '300.00',
            'month': self.current_month
        }
        response = self.client.post('/api/budgets/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_budget_invalid_category(self):
        data = {
            'category': 'INVALID_CAT',
            'limit_amount': '100.00',
            'month': self.current_month
        }
        response = self.client.post('/api/budgets/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_budget_invalid_month(self):
        data = {
            'category': 'FOOD',
            'limit_amount': '100.00',
            'month': 'Julyyyy'
        }
        response = self.client.post('/api/budgets/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_budget_invalid_limit(self):
        data = {
            'category': 'FOOD',
            'limit_amount': '-10.00',
            'month': self.current_month
        }
        response = self.client.post('/api/budgets/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("limit_amount", response.data)

    def test_create_budget_previous_month_fails(self):
        today = datetime.date.today()
        current_month_index = today.month
        if current_month_index > 1:
            VALID_MONTHS = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]
            past_month = VALID_MONTHS[current_month_index - 2]
            data = {
                'category': 'FOOD',
                'limit_amount': '100.00',
                'month': past_month
            }
            response = self.client.post('/api/budgets/', data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("month", response.data)

