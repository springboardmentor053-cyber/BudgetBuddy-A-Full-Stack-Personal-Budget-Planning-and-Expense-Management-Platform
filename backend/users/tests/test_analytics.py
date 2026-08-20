from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AnalyticsAPITestCase(APITestCase):
    def setUp(self):
        # Create and authenticate test user
        self.user = User.objects.create_user(
            username='analyticstester',
            email='testanalytics@example.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_dashboard_analytics_summary(self):
        """Test GET /api/auth/dashboard/ returns valid HTTP 200 payload"""
        response = self.client.get('/api/auth/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_income'], 0.0)
        self.assertEqual(response.data['total_expense'], 0.0)
        self.assertEqual(response.data['income'], 0.0)
        self.assertEqual(response.data['expenses'], 0.0)
        self.assertEqual(response.data['current_balance'], 0.0)
        self.assertEqual(response.data['recent_transactions'], [])

    def test_budgets_summary_endpoint(self):
        """Test GET /api/budgets/ endpoint status for budget utilization analytics"""
        response = self.client.get('/api/budgets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_savings_goals_endpoint(self):
        """Test GET /api/savings/goals/ endpoint status for savings goal analytics"""
        response = self.client.get('/api/savings/goals/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
