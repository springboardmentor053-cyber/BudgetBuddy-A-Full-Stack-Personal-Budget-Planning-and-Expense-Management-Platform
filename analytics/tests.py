import datetime
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from notifications.models import Notification

class AnalyticsAPITests(APITestCase):
    def setUp(self):
        # Create user and authenticate
        self.user = User.objects.create_user(username='analyticsuser', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Date math for tests
        self.today = datetime.date.today()
        self.current_month_str = self.today.strftime("%B")
        
        # 1st of current month
        self.start_of_month = datetime.date(self.today.year, self.today.month, 1)
        
        # 5 days ago (still current month, except if today is early in the month)
        # To be safe, let's use 1st of month + some days, or just today.
        self.date_current_month = self.start_of_month
        
        # Previous month date
        if self.today.month == 1:
            self.date_prev_month = datetime.date(self.today.year - 1, 12, 15)
        else:
            self.date_prev_month = datetime.date(self.today.year, self.today.month - 1, 15)
            
        # Create Incomes
        Income.objects.create(user=self.user, title="Salary", amount=10000.00, source="SALARY", income_date=self.date_current_month)
        Income.objects.create(user=self.user, title="Freelance", amount=2500.00, source="FREELANCING", income_date=self.date_prev_month)
        
        # Create Expenses
        Expense.objects.create(user=self.user, category="FOOD", amount=2000.00, date=self.date_current_month, description="Groceries")
        Expense.objects.create(user=self.user, category="SHOPPING", amount=3000.00, date=self.date_current_month, description="Shoes")
        Expense.objects.create(user=self.user, category="TRAVEL", amount=1500.00, date=self.date_prev_month, description="Flight")
        
        # Create Budgets
        Budget.objects.create(user=self.user, category="FOOD", limit_amount=5000.00, month=self.current_month_str)
        Budget.objects.create(user=self.user, category="SHOPPING", limit_amount=4000.00, month=self.current_month_str)
        
        # Create Savings Goals
        future_date = self.today + datetime.timedelta(days=60)
        SavingsGoal.objects.create(user=self.user, goal_name="Emergency Fund", target_amount=10000.00, saved_amount=2500.00, target_date=future_date, status="In Progress")
        SavingsGoal.objects.create(user=self.user, goal_name="Vacation", target_amount=5000.00, saved_amount=5000.00, target_date=future_date, status="Completed")
        
        # Create Notification
        Notification.objects.create(user=self.user, title="Budget Warning", message="You spent 60% of your Food budget", notification_type="Budget", priority="Medium")

    def test_financial_summary_api(self):
        response = self.client.get('/api/analytics/financial-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # total_income = 10000 + 2500 = 12500
        # total_expense = 2000 + 3000 + 1500 = 6500
        # current_balance = 12500 - 6500 = 6000
        # total_savings = 2500 + 5000 = 7500
        # remaining_budget:
        #   budgets: FOOD (5000 limit), SHOPPING (4000 limit) -> total budget limit = 9000
        #   spent: FOOD (2000 spent), SHOPPING (3000 spent) -> total spent = 5000
        #   remaining = 9000 - 5000 = 4000
        data = response.data
        self.assertEqual(data['total_income'], 12500.0)
        self.assertEqual(data['total_expense'], 6500.0)
        self.assertEqual(data['current_balance'], 6000.0)
        self.assertEqual(data['total_savings'], 7500.0)
        self.assertEqual(data['remaining_budget'], 4000.0)

    def test_category_expense_analysis_api(self):
        response = self.client.get('/api/analytics/category-expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(data.get('Food'), 2000.0)
        self.assertEqual(data.get('Shopping'), 3000.0)
        self.assertEqual(data.get('Travel'), 1500.0)

    def test_monthly_expense_trend_api(self):
        response = self.client.get('/api/analytics/monthly-trends/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        current_month_name = self.current_month_str
        
        month_names = {
            1: "January", 2: "February", 3: "March", 4: "April",
            5: "May", 6: "June", 7: "July", 8: "August",
            9: "September", 10: "October", 11: "November", 12: "December"
        }
        prev_month_name = month_names[self.date_prev_month.month]
        
        if current_month_name == prev_month_name:
            # If both dates fall in the same month name (e.g. running test right at month boundary transition)
            self.assertEqual(data[current_month_name], 6500.0)
        else:
            self.assertEqual(data[current_month_name], 5000.0) # 2000 + 3000
            self.assertEqual(data[prev_month_name], 1500.0)

    def test_expense_extremes_api(self):
        response = self.client.get('/api/analytics/expense-extremes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        # highest = SHOPPING (3000.0)
        self.assertEqual(float(data['highest_expense']['amount']), 3000.0)
        self.assertEqual(data['highest_expense']['category'], 'SHOPPING')
        
        # lowest = TRAVEL (1500.0)
        self.assertEqual(float(data['lowest_expense']['amount']), 1500.0)
        self.assertEqual(data['lowest_expense']['category'], 'TRAVEL')

    def test_analytics_dashboard_api(self):
        response = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertIn('financial_summary', data)
        self.assertIn('category_wise_analysis', data)
        self.assertIn('monthly_trend', data)
        self.assertIn('recent_transactions', data)
        self.assertIn('latest_notifications', data)
        self.assertIn('active_savings_goals', data)
        
        # Verify active savings goals only includes "Emergency Fund" (status In Progress), not "Vacation" (status Completed)
        active_goals = data['active_savings_goals']
        self.assertEqual(len(active_goals), 1)
        self.assertEqual(active_goals[0]['goal_name'], 'Emergency Fund')
        
        # Verify notification list contains the one we created
        notifications = data['latest_notifications']
        self.assertTrue(len(notifications) >= 1)
        self.assertTrue(any(n['title'] == 'Budget Warning' for n in notifications))
