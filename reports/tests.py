import datetime
import csv
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification

class ReportsAPITests(APITestCase):
    def setUp(self):
        # Create user and authenticate
        self.user = User.objects.create_user(username='reportsuser', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Date calculations
        self.today = datetime.date.today()
        self.current_month_str = self.today.strftime("%B")
        self.start_of_month = datetime.date(self.today.year, self.today.month, 1)
        self.date_current_month = self.start_of_month
        
        # Find last month name and date
        if self.today.month == 1:
            self.date_prev_month = datetime.date(self.today.year - 1, 12, 15)
            self.prev_month_str = "December"
        else:
            self.date_prev_month = datetime.date(self.today.year, self.today.month - 1, 15)
            self.prev_month_str = self.date_prev_month.strftime("%B")
            
        # Create Incomes
        self.inc_current = Income.objects.create(
            user=self.user, title="Job Salary", amount=8000.00, source="SALARY", income_date=self.date_current_month
        )
        self.inc_prev = Income.objects.create(
            user=self.user, title="Side Project", amount=2000.00, source="FREELANCING", income_date=self.date_prev_month
        )
        
        # Create Expenses
        self.exp_current = Expense.objects.create(
            user=self.user, category="FOOD", amount=1200.00, date=self.date_current_month, description="Pizza"
        )
        self.exp_prev = Expense.objects.create(
            user=self.user, category="TRAVEL", amount=800.00, date=self.date_prev_month, description="Bus fare"
        )
        
        # Create Budgets
        Budget.objects.create(user=self.user, category="FOOD", limit_amount=3000.00, month=self.current_month_str)
        Budget.objects.create(user=self.user, category="TRAVEL", limit_amount=1500.00, month=self.prev_month_str)
        
        # Create Savings Goals
        future_date = self.today + datetime.timedelta(days=90)
        self.goal = SavingsGoal.objects.create(
            user=self.user, goal_name="New Phone", target_amount=1000.00, saved_amount=300.00, target_date=future_date, status="In Progress"
        )
        
        # Create Notification
        Notification.objects.create(user=self.user, title="Report Ready", message="Your monthly report is generated", notification_type="Report", priority="Low")

    def test_monthly_financial_report_current_month(self):
        response = self.client.get('/api/reports/monthly-financial/', {'filter_type': 'current_month'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        # total_income = 8000.0
        # total_expense = 1200.0
        # balance = 6800.0
        # savings = 300.0
        # budget: limit FOOD (3000) - spent FOOD (1200) = 1800
        self.assertEqual(data['total_income'], 8000.0)
        self.assertEqual(data['total_expense'], 1200.0)
        self.assertEqual(data['current_balance'], 6800.0)
        self.assertEqual(data['total_savings'], 300.0)
        self.assertEqual(data['remaining_budget'], 1800.0)

    def test_monthly_financial_report_previous_month(self):
        response = self.client.get('/api/reports/monthly-financial/', {'filter_type': 'previous_month'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        # total_income = 2000.0
        # total_expense = 800.0
        # balance = 1200.0
        # savings = 300.0
        # budget: limit TRAVEL (1500) - spent TRAVEL (800) = 700
        self.assertEqual(data['total_income'], 2000.0)
        self.assertEqual(data['total_expense'], 800.0)
        self.assertEqual(data['current_balance'], 1200.0)
        self.assertEqual(data['total_savings'], 300.0)
        self.assertEqual(data['remaining_budget'], 700.0)

    def test_monthly_financial_report_custom_range(self):
        # Custom range covering both months
        start_date = self.date_prev_month - datetime.timedelta(days=1)
        end_date = self.today
        
        response = self.client.get('/api/reports/monthly-financial/', {
            'filter_type': 'custom',
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        # total_income = 8000 + 2000 = 10000.0
        # total_expense = 1200 + 800 = 2000.0
        # balance = 8000.0
        # Remaining budget uses starting month of range (prev_month_str)
        # limit TRAVEL (1500) - spent TRAVEL in range (800) = 700
        self.assertEqual(data['total_income'], 10000.0)
        self.assertEqual(data['total_expense'], 2000.0)
        self.assertEqual(data['current_balance'], 8000.0)

    def test_expense_report_filters(self):
        # Current month expenses only
        response = self.client.get('/api/reports/expenses/', {'filter_type': 'current_month'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], 'FOOD')
        self.assertEqual(response.data[0]['title'], 'Pizza') # description fallback
        
        # Previous month expenses only
        response = self.client.get('/api/reports/expenses/', {'filter_type': 'previous_month'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], 'TRAVEL')
        self.assertEqual(response.data[0]['title'], 'Bus fare')

    def test_savings_report(self):
        response = self.client.get('/api/reports/savings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(len(response.data), 1)
        data = response.data[0]
        self.assertEqual(data['goal_name'], 'New Phone')
        self.assertEqual(data['target_amount'], 1000.0)
        self.assertEqual(data['saved_amount'], 300.0)
        self.assertEqual(data['remaining_amount'], 700.0)
        self.assertEqual(data['progress_percentage'], 30.0)
        self.assertEqual(data['status'], 'In Progress')

    def test_combined_financial_report(self):
        response = self.client.get('/api/reports/financial-summary-report/', {'filter_type': 'current_month'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertIn('financial_summary', data)
        self.assertIn('expense_summary', data)
        self.assertIn('income_summary', data)
        self.assertIn('budget_summary', data)
        self.assertIn('savings_summary', data)
        self.assertIn('latest_notifications', data)
        
        # Check current month filtering logic applied inside combined summary
        self.assertEqual(len(data['expense_summary']), 1)
        self.assertEqual(data['expense_summary'][0]['category'], 'FOOD')
        
        self.assertEqual(len(data['income_summary']), 1)
        self.assertEqual(data['income_summary'][0]['title'], 'Job Salary')

    def test_export_report_json(self):
        response = self.client.get('/api/reports/export/', {'filter_type': 'current_month', 'export': 'json'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('financial_summary', response.data)
        self.assertIn('expenses', response.data)
        self.assertIn('incomes', response.data)

    def test_export_report_csv(self):
        response = self.client.get('/api/reports/export/', {'filter_type': 'current_month', 'export': 'csv'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertTrue('attachment' in response['Content-Disposition'])
        
        # Parse CSV output
        content = response.content.decode('utf-8')
        lines = content.splitlines()
        reader = csv.reader(lines)
        rows = list(reader)
        
        # Verify Headers
        self.assertEqual(rows[0], ['Type', 'Title/Category', 'Amount', 'Date', 'Description'])
        
        # Verify Rows (1 Income, 1 Expense inside current month)
        self.assertEqual(len(rows), 3) # Header + 2 data rows
        
        # Confirm details are correct
        # Income first or Expense first depending on date sorting (both are start_of_month)
        types = [row[0] for row in rows[1:]]
        self.assertIn('Income', types)
        self.assertIn('Expense', types)


class FullFlowIntegrationTests(APITestCase):
    def test_complete_integration_flow(self):
        # 1. Test User Registration
        register_data = {
            'username': 'integration_user',
            'email': 'integration@test.com',
            'password': 'StrongPassword123!'
        }
        response = self.client.post('/api/users/register/', register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'integration_user')
        
        # 2. Test Login & JWT Token Retrieval
        login_data = {
            'username': 'integration_user',
            'password': 'StrongPassword123!'
        }
        response = self.client.post('/api/token/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        access_token = response.data['access']
        
        # Authenticate future client calls with the JWT token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # 3. Test Budget Creation (Valid & Negative Limit validation)
        current_month = datetime.date.today().strftime('%B')
        
        # Negative limit check
        invalid_budget_data = {
            'category': 'FOOD',
            'limit_amount': '-150.00',
            'month': current_month
        }
        response = self.client.post('/api/budgets/', invalid_budget_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Valid budget creation
        valid_budget_data = {
            'category': 'FOOD',
            'limit_amount': '500.00',
            'month': current_month
        }
        response = self.client.post('/api/budgets/', valid_budget_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 4. Test Income Management (Valid & Negative Amount validation)
        invalid_income_data = {
            'title': 'Job salary',
            'amount': '-1000.00',
            'source': 'SALARY',
            'income_date': datetime.date.today().strftime('%Y-%m-%d')
        }
        response = self.client.post('/api/income/', invalid_income_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        valid_income_data = {
            'title': 'Job salary',
            'amount': '3000.00',
            'source': 'SALARY',
            'income_date': datetime.date.today().strftime('%Y-%m-%d')
        }
        response = self.client.post('/api/income/', valid_income_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 5. Test Expense Management (Valid & Negative Amount validation)
        invalid_expense_data = {
            'category': 'FOOD',
            'amount': '-50.00',
            'date': datetime.date.today().strftime('%Y-%m-%d'),
            'description': 'Snack'
        }
        response = self.client.post('/api/expenses/', invalid_expense_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # First valid expense under budget
        valid_expense_data = {
            'category': 'FOOD',
            'amount': '100.00',
            'date': datetime.date.today().strftime('%Y-%m-%d'),
            'description': 'Lunch'
        }
        response = self.client.post('/api/expenses/', valid_expense_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Second valid expense to trigger budget limit warning (total FOOD spent: 420.00, which is >= 80% of 500)
        warning_expense_data = {
            'category': 'FOOD',
            'amount': '320.00',
            'date': datetime.date.today().strftime('%Y-%m-%d'),
            'description': 'Grocery Shopping'
        }
        response = self.client.post('/api/expenses/', warning_expense_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Third valid expense to trigger budget limit exceedance (total FOOD spent: 570.00, which is > 500)
        exceeding_expense_data = {
            'category': 'FOOD',
            'amount': '150.00',
            'date': datetime.date.today().strftime('%Y-%m-%d'),
            'description': 'Dinner Party'
        }
        response = self.client.post('/api/expenses/', exceeding_expense_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 6. Test Notifications & Budget Alerts
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify exceedance and warning notifications are generated
        titles = [notif['title'] for notif in response.data]
        self.assertIn('Budget Limit Warning', titles)
        self.assertIn('Budget Limit Exceeded', titles)
        
        # 7. Test Analytics, Reports and calculations
        response = self.client.get('/api/reports/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Total income: 3000, Total expense: 570, balance: 2430
        self.assertEqual(response.data['total_income'], 3000.00)
        self.assertEqual(response.data['total_expense'], 570.00)
        self.assertEqual(response.data['balance'], 2430.00)
        
        # Test combined report endpoint
        response = self.client.get('/api/reports/financial-summary-report/', {'filter_type': 'current_month'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['financial_summary']['total_income'], 3000.00)
        self.assertEqual(response.data['financial_summary']['total_expense'], 570.00)

