import datetime
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from .models import SavingsGoal

class SavingsGoalAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.other_user = User.objects.create_user(username='otheruser', password='password123')
        
        # Authenticate main user
        self.client.force_authenticate(user=self.user)
        
        # Future dates for tests
        self.future_date = (datetime.date.today() + datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        self.past_date = (datetime.date.today() - datetime.timedelta(days=5)).strftime('%Y-%m-%d')

    def test_create_savings_goal_valid(self):
        data = {
            'goal_name': 'New Laptop',
            'target_amount': '1500.00',
            'saved_amount': '100.00',
            'target_date': self.future_date,
            'status': 'Pending'
        }
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['goal_name'], 'New Laptop')
        self.assertEqual(float(response.data['target_amount']), 1500.00)
        self.assertEqual(float(response.data['saved_amount']), 100.00)
        self.assertEqual(response.data['target_date'], self.future_date)
        self.assertEqual(response.data['status'], 'Pending')

    def test_create_savings_goal_invalid_target(self):
        data = {
            'goal_name': 'New Laptop',
            'target_amount': '-100.00',  # <= 0
            'saved_amount': '100.00',
            'target_date': self.future_date
        }
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("target_amount", response.data)

        # Target amount = 0
        data['target_amount'] = '0.00'
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("target_amount", response.data)

    def test_create_savings_goal_invalid_saved(self):
        data = {
            'goal_name': 'New Laptop',
            'target_amount': '1500.00',
            'saved_amount': '-10.00',  # negative
            'target_date': self.future_date
        }
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("saved_amount", response.data)

    def test_create_savings_goal_past_date_fails(self):
        data = {
            'goal_name': 'New Laptop',
            'target_amount': '1500.00',
            'saved_amount': '100.00',
            'target_date': self.past_date  # in the past
        }
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("target_date", response.data)

    def test_create_savings_goal_saved_exceeds_target_fails(self):
        data = {
            'goal_name': 'New Laptop',
            'target_amount': '1500.00',
            'saved_amount': '1600.00',  # > target
            'target_date': self.future_date
        }
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("saved_amount", response.data)

    def test_create_savings_goal_auto_completed_when_saved_equals_target(self):
        data = {
            'goal_name': 'New Laptop',
            'target_amount': '1500.00',
            'saved_amount': '1500.00',  # saved == target
            'target_date': self.future_date,
            'status': 'Pending'  # Will automatically become Completed
        }
        response = self.client.post('/api/savings/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'Completed')

    def test_update_savings_goal_auto_completed(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='New Laptop',
            target_amount=1500.00,
            saved_amount=500.00,
            target_date=self.future_date,
            status='In Progress'
        )
        data = {
            'saved_amount': '1500.00'  # updated to equal target
        }
        response = self.client.patch(f'/api/savings/{goal.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Completed')

    def test_list_savings_goals_only_returns_own_goals(self):
        # Create goal for authenticated user
        goal_own = SavingsGoal.objects.create(
            user=self.user,
            goal_name='My Laptop',
            target_amount=1500.00,
            saved_amount=100.00,
            target_date=self.future_date
        )
        # Create goal for other user
        goal_other = SavingsGoal.objects.create(
            user=self.other_user,
            goal_name='Their Laptop',
            target_amount=2000.00,
            saved_amount=200.00,
            target_date=self.future_date
        )
        
        response = self.client.get('/api/savings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['goal_name'], 'My Laptop')

    def test_get_progress_api_calculations(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='Trip to Paris',
            target_amount=2000.00,
            saved_amount=500.00,
            target_date=self.future_date,
            status='In Progress'
        )
        response = self.client.get(f'/api/savings/{goal.id}/progress/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['goal_name'], 'Trip to Paris')
        self.assertEqual(float(response.data['target_amount']), 2000.00)
        self.assertEqual(float(response.data['saved_amount']), 500.00)
        self.assertEqual(float(response.data['remaining_amount']), 1500.00)  # 2000 - 500
        self.assertEqual(float(response.data['progress_percentage']), 25.0)  # (500 / 2000) * 100
        self.assertEqual(response.data['status'], 'In Progress')

    def test_unauthenticated_access_denied(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/savings/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_recurring_auto_save_processing(self):
        from .services import process_recurring_savings_for_user
        from expenses.models import Expense
        
        # Setup goal: automated, daily, last_auto_save_date was 2 days ago
        two_days_ago = datetime.date.today() - datetime.timedelta(days=2)
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='Daily Savings',
            target_amount=1000.00,
            saved_amount=50.00,
            target_date=self.future_date,
            is_automated=True,
            auto_save_amount=10.00,
            frequency='Daily',
            auto_save_start_date=two_days_ago,
            last_auto_save_date=two_days_ago,
            status='In Progress'
        )
        
        # Clear expenses to simplify count
        Expense.objects.all().delete()
        
        # Run processing
        process_recurring_savings_for_user(self.user)
        
        # Verify 2 SAVINGS expenses were created
        expenses = Expense.objects.filter(user=self.user, category='SAVINGS')
        self.assertEqual(expenses.count(), 2)
        
        # Verify dates: 1 day ago and today
        expected_dates = [
            two_days_ago + datetime.timedelta(days=1),
            datetime.date.today()
        ]
        self.assertEqual(list(expenses.values_list('date', flat=True)), expected_dates)
        
        # Verify savings goal saved_amount updated: 50.00 + 10.00 * 2 = 70.00
        goal.refresh_from_db()
        self.assertEqual(float(goal.saved_amount), 70.00)
        self.assertEqual(goal.last_auto_save_date, datetime.date.today())
