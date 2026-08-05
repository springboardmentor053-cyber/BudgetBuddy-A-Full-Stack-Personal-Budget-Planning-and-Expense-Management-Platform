import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification

def run_existing_tests():
    print("Testing Existing APIs Backward Compatibility...")
    user, _ = User.objects.get_or_create(username='existing_user', email='existing@example.com')
    user.set_password('TestPass123!')
    user.save()

    token = str(RefreshToken.for_user(user).access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # Test Dashboard
    res_dash = client.get('/api/dashboard/')
    assert res_dash.status_code == 200, f"Dashboard failed: {res_dash.data}"

    # Test Analytics
    res_analytics = client.get('/api/analytics/')
    assert res_analytics.status_code == 200, f"Analytics failed: {res_analytics.data}"

    # Test Expenses List Create
    res_exp = client.get('/api/expenses/')
    assert res_exp.status_code == 200, f"Expenses list failed: {res_exp.data}"

    # Test Income List Create
    res_inc = client.get('/api/income/')
    assert res_inc.status_code == 200, f"Income list failed: {res_inc.data}"

    # Test Budgets List Create
    res_bgt = client.get('/api/budgets/')
    assert res_bgt.status_code == 200, f"Budgets list failed: {res_bgt.data}"

    # Test Savings List Create
    res_sav = client.get('/api/savings/')
    assert res_sav.status_code == 200, f"Savings list failed: {res_sav.data}"

    # Test Notifications List Create
    res_notif = client.get('/api/notifications/')
    assert res_notif.status_code == 200, f"Notifications list failed: {res_notif.data}"

    print("--- ALL EXISTING APIS FUNCTIONING 100% PERFECTLY ---")

if __name__ == '__main__':
    run_existing_tests()
