from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from expenses.models import Expense
from rest_framework import status
import datetime

class ExpenseAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Create initial test expenses
        self.expense1 = Expense.objects.create(
            user=self.user,
            category='FOOD',
            amount=20.00,
            date=datetime.date(2026, 7, 1),
            description='Lunch'
        )
        self.expense2 = Expense.objects.create(
            user=self.user,
            category='TRAVEL',
            amount=50.00,
            date=datetime.date(2026, 7, 10),
            description='Taxi'
        )
        self.expense3 = Expense.objects.create(
            user=self.user,
            category='FOOD',
            amount=15.00,
            date=datetime.date(2026, 7, 5),
            description='Coffee'
        )

    def test_create_expense_valid(self):
        data = {
            'category': 'SHOPPING',
            'amount': '120.00',
            'date': '2026-07-15',
            'description': 'Shoes'
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data['amount']), 120.00)
        self.assertEqual(response.data['category'], 'SHOPPING')

    def test_create_expense_normalized_category(self):
        data = {
            'category': 'Food',
            'amount': '45.00',
            'date': '2026-07-16',
            'description': 'Dinner'
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'FOOD')

    def test_create_expense_invalid_category(self):
        data = {
            'category': 'INVALID_CAT',
            'amount': '10.00',
            'date': '2026-07-15'
        }
        response = self.client.post('/api/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_view_expenses_list(self):
        response = self.client.get('/api/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_update_expense(self):
        data = {
            'category': 'BILLS',
            'amount': '25.00',
            'date': '2026-07-01',
            'description': 'Water bill'
        }
        response = self.client.put(f'/api/expenses/{self.expense1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['category'], 'BILLS')
        self.assertEqual(float(response.data['amount']), 25.00)

    def test_delete_expense(self):
        response = self.client.delete(f'/api/expenses/{self.expense1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.filter(id=self.expense1.id).count(), 0)

    def test_filter_expenses_by_category(self):
        response = self.client.get('/api/expenses/?category=FOOD')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        categories = [item['category'] for item in response.data]
        self.assertTrue(all(cat == 'FOOD' for cat in categories))

    def test_sort_expenses(self):
        # Latest first (default or sort=latest)
        response = self.client.get('/api/expenses/?sort=latest')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], self.expense2.id)
        self.assertEqual(response.data[2]['id'], self.expense1.id)

        # Oldest first (sort=oldest)
        response = self.client.get('/api/expenses/?sort=oldest')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], self.expense1.id)

        # Highest amount first (sort=highest)
        response = self.client.get('/api/expenses/?sort=highest')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], self.expense2.id) # 50.00

        # Lowest amount first (sort=lowest)
        response = self.client.get('/api/expenses/?sort=lowest')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], self.expense3.id) # 15.00

    def test_total_expenses_all(self):
        response = self.client.get('/api/expenses/total/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_expenses'], 85.00) # 20 + 50 + 15

    def test_total_expenses_filtered(self):
        response = self.client.get('/api/expenses/total/?category=FOOD')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_expenses'], 35.00) # 20 + 15
