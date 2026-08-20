from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from budgets.models import Budget
from income.models import Income
from notifications.models import Notification
from users.ai_views import build_financial_context
from users.models import Expense


class DataSynchronizationTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='sync-user', password='StrongPass123')
        self.client.force_authenticate(self.user)

    def test_budget_card_uses_case_insensitive_monthly_expense_total(self):
        budget = Budget.objects.create(user=self.user, category='shopping', budget_amount='10000.00', month=8, year=2026)
        Expense.objects.create(user=self.user, title='Shoes', amount='6700.00', category='SHOPPING', expense_date=date(2026, 8, 12))
        Expense.objects.create(user=self.user, title='Old purchase', amount='999.00', category='SHOPPING', expense_date=date(2026, 7, 12))

        response = self.client.get('/api/budgets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['spent'], 6700.0)
        self.assertEqual(response.data[0]['remaining'], 3300.0)
        self.assertEqual(response.data[0]['percentage_used'], 67.0)

        summary = self.client.get(f'/api/budgets/{budget.id}/summary/')
        self.assertEqual(summary.status_code, status.HTTP_200_OK)
        self.assertEqual(summary.data['spent'], 6700.0)

    def test_notifications_persist_for_create_update_and_list(self):
        expense = Expense.objects.create(user=self.user, title='Groceries', amount='100.00', category='FOOD', expense_date=date(2026, 8, 1))
        income = Income.objects.create(user=self.user, title='Salary', amount='80000.00', category='SALARY', income_date=date(2026, 8, 1))
        budget = Budget.objects.create(user=self.user, category='FOOD', budget_amount='2000.00', month=8, year=2026)
        expense.amount = '150.00'
        expense.save()
        income.amount = '81000.00'
        income.save()
        budget.budget_amount = '2500.00'
        budget.save()

        self.assertEqual(Notification.objects.filter(user=self.user, notification_type='TRANSACTION').count(), 4)
        self.assertEqual(Notification.objects.filter(user=self.user, notification_type='BUDGET_ALERT').count(), 2)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        self.assertGreaterEqual(response.data[0]['created_at'], response.data[-1]['created_at'])

    def test_ai_context_reads_current_income_expenses_transactions_and_budgets(self):
        Income.objects.create(user=self.user, title='August salary', amount='80000.00', category='SALARY', income_date=date(2026, 8, 1))
        Expense.objects.create(user=self.user, title='Shopping trip', amount='6700.00', category='SHOPPING', expense_date=date(2026, 8, 2))
        Budget.objects.create(user=self.user, category='shopping', budget_amount='10000.00', month=8, year=2026)

        context = build_financial_context(self.user)
        self.assertEqual(context['total_income'], 80000.0)
        self.assertEqual(context['total_expenses'], 6700.0)
        self.assertEqual(context['net_balance'], 73300.0)
        self.assertEqual(len(context['recent_transactions']), 2)
        self.assertEqual(context['budgets'][0]['spent'], 6700.0)
        self.assertEqual(context['budgets'][0]['remaining'], 3300.0)
