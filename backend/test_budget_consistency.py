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

def run_consistency_tests():
    print("Testing Dashboard & Budgets Page Consistency...")

    # 1. Setup Test User
    user, _ = User.objects.get_or_create(username='consistency_test_user', email='consistency@example.com')
    user.set_password('TestPass123!')
    user.save()

    # Clean data
    Expense.objects.filter(user=user).delete()
    Income.objects.filter(user=user).delete()
    Budget.objects.filter(user=user).delete()

    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    today = date.today()
    curr_m = today.month
    curr_y = today.year

    # SCENARIO 1 (User Problem Statement):
    # Food Budget = $500
    # Food Expense = $400
    # Shopping Expense = $1000 (No budget defined)
    # Travel Expense = $400 (No budget defined)
    # Income = $5000

    Income.objects.create(user=user, source='Salary', amount=Decimal('5000.00'), income_date=today)
    Budget.objects.create(user=user, category='FOOD', budget_amount=Decimal('500.00'), month=curr_m, year=curr_y)
    
    Expense.objects.create(user=user, title='Grocery', amount=Decimal('400.00'), category='FOOD', expense_date=today)
    Expense.objects.create(user=user, title='Clothes', amount=Decimal('1000.00'), category='SHOPPING', expense_date=today)
    Expense.objects.create(user=user, title='Flight', amount=Decimal('400.00'), category='TRAVEL', expense_date=today)

    res_dash = client.get('/api/dashboard/')
    assert res_dash.status_code == 200
    fin = res_dash.data['financial_summary']

    print(f"Scenario 1 Financial Summary: {fin}")

    assert fin['total_income'] == 5000.0
    assert fin['total_expense'] == 1800.0
    assert fin['current_balance'] == 3200.0
    assert fin['total_budget'] == 500.0
    # CRITICAL: Remaining budget MUST be $100 (500 - 400), NOT -$1300 (500 - 1800)!
    assert fin['remaining_budget'] == 100.0, f"Expected remaining_budget=100.0, got {fin['remaining_budget']}"
    print("[PASS] Scenario 1: Remaining budget correctly isolates Food budget ($100.00)")

    # SCENARIO 2 (Multiple Categories & Budgets):
    # Add Travel Budget = $300
    # Travel Expense = $400 (Overbudget by $100 -> remaining -$100)
    # Food Remaining = $100
    # Total Remaining = $100 + (-$100) = $0
    # Total Budget = $500 + $300 = $800

    Budget.objects.create(user=user, category='TRAVEL', budget_amount=Decimal('300.00'), month=curr_m, year=curr_y)

    res_dash2 = client.get('/api/dashboard/')
    assert res_dash2.status_code == 200
    fin2 = res_dash2.data['financial_summary']

    print(f"Scenario 2 Financial Summary: {fin2}")

    assert fin2['total_budget'] == 800.0
    # Food remaining = 500 - 400 = 100. Travel remaining = 300 - 400 = -100. Total remaining = 0.
    assert fin2['remaining_budget'] == 0.0, f"Expected remaining_budget=0.0, got {fin2['remaining_budget']}"
    print("[PASS] Scenario 2: Multiple categories category-wise budget calculation verified ($0.00)")

    print("\n--- ALL BUDGET CONSISTENCY TESTS PASSED SUCCESSFULLY ---")

if __name__ == '__main__':
    run_consistency_tests()
