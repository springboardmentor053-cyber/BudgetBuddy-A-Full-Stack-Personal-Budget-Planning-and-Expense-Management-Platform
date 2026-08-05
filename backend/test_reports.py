import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification

def run_tests():
    print("Starting Comprehensive Reports Module Verification...")
    
    # 1. Setup Test Users
    user1, _ = User.objects.get_or_create(username='report_user1', email='user1@example.com')
    user1.set_password('TestPass123!')
    user1.save()

    user2, _ = User.objects.get_or_create(username='report_user2', email='user2@example.com')
    user2.set_password('TestPass123!')
    user2.save()

    # Clean previous test data
    Expense.objects.filter(user__in=[user1, user2]).delete()
    Income.objects.filter(user__in=[user1, user2]).delete()
    Budget.objects.filter(user__in=[user1, user2]).delete()
    SavingsGoal.objects.filter(user__in=[user1, user2]).delete()
    Notification.objects.filter(user__in=[user1, user2]).delete()

    today = date.today()
    curr_month = today.month
    curr_year = today.year

    # 2. Populate User 1 Data
    Income.objects.create(user=user1, source='Salary', amount=Decimal('5000.00'), income_date=today, description='Monthly Salary')
    Income.objects.create(user=user1, source='Freelance', amount=Decimal('1200.00'), income_date=today, description='Side project')
    
    Expense.objects.create(user=user1, title='Groceries', amount=Decimal('400.00'), category='FOOD', expense_date=today, description='Supermarket')
    Expense.objects.create(user=user1, title='Gas', amount=Decimal('100.00'), category='TRAVEL', expense_date=today, description='Fuel')
    
    Budget.objects.create(user=user1, category='FOOD', budget_amount=Decimal('600.00'), month=curr_month, year=curr_year)
    Budget.objects.create(user=user1, category='TRAVEL', budget_amount=Decimal('200.00'), month=curr_month, year=curr_year)

    SavingsGoal.objects.create(user=user1, goal_name='Emergency Fund', target_amount=Decimal('5000.00'), saved_amount=Decimal('2500.00'), target_date=today + timedelta(days=90), status='ACTIVE')
    SavingsGoal.objects.create(user=user1, goal_name='Vacation', target_amount=Decimal('1000.00'), saved_amount=Decimal('1000.00'), target_date=today + timedelta(days=30), status='COMPLETED')

    Notification.objects.create(user=user1, title='Welcome', message='Welcome to BudgetBuddy!', notification_type='SYSTEM', priority='LOW')

    # 3. Populate User 2 Data (User isolation check)
    Income.objects.create(user=user2, source='User2 Salary', amount=Decimal('9999.00'), income_date=today)
    Expense.objects.create(user=user2, title='User2 Luxury', amount=Decimal('8888.00'), category='MISCELLANEOUS', expense_date=today)

    # 4. Setup API Client for User 1
    token1 = str(RefreshToken.for_user(user1).access_token)
    client1 = APIClient()
    client1.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')

    token2 = str(RefreshToken.for_user(user2).access_token)
    client2 = APIClient()
    client2.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')

    results = {}

    # Test 1: Monthly Financial Report API
    res_m = client1.get('/api/reports/monthly/')
    assert res_m.status_code == 200, f"Monthly API failed: {res_m.data}"
    m_data = res_m.data
    assert m_data['total_income'] == 6200.0, f"Expected 6200.0, got {m_data['total_income']}"
    assert m_data['total_expense'] == 500.0, f"Expected 500.0, got {m_data['total_expense']}"
    assert m_data['current_balance'] == 5700.0, f"Expected 5700.0 (6200-500), got {m_data['current_balance']}"
    assert m_data['total_budget'] == 800.0, f"Expected 800.0, got {m_data['total_budget']}"
    assert m_data['remaining_budget'] == 300.0, f"Expected 300.0 (800-500), got {m_data['remaining_budget']}"
    assert m_data['total_savings'] == 3500.0, f"Expected 3500.0, got {m_data['total_savings']}"
    results['Monthly Financial Report API'] = 'PASS'

    # Test 2: Expense Report API
    res_e = client1.get('/api/reports/expenses/')
    assert res_e.status_code == 200, f"Expense API failed: {res_e.data}"
    e_list = res_e.data
    assert len(e_list) == 2, f"Expected 2 expenses for user1, got {len(e_list)}"
    item0 = e_list[0]
    assert 'title' in item0 and 'category' in item0 and 'amount' in item0 and 'date' in item0 and 'description' in item0
    results['Expense Report API'] = 'PASS'

    # Test 3: Savings Report API
    res_s = client1.get('/api/reports/savings/')
    assert res_s.status_code == 200, f"Savings API failed: {res_s.data}"
    s_list = res_s.data
    assert len(s_list) == 2, f"Expected 2 savings goals, got {len(s_list)}"
    g1 = next(g for g in s_list if g['goal_name'] == 'Emergency Fund')
    assert g1['remaining_amount'] == 2500.0, f"Expected remaining 2500.0, got {g1['remaining_amount']}"
    assert g1['progress_percentage'] == 50.0, f"Expected progress 50.0%, got {g1['progress_percentage']}"
    g2 = next(g for g in s_list if g['goal_name'] == 'Vacation')
    assert g2['remaining_amount'] == 0.0, f"Expected remaining 0.0, got {g2['remaining_amount']}"
    assert g2['progress_percentage'] == 100.0, f"Expected progress 100.0%, got {g2['progress_percentage']}"
    results['Savings Report API'] = 'PASS'

    # Test 4: Combined Summary API
    res_sum = client1.get('/api/reports/summary/')
    assert res_sum.status_code == 200, f"Summary API failed: {res_sum.data}"
    sum_data = res_sum.data
    assert 'financial_summary' in sum_data and 'expense_summary' in sum_data and 'savings_summary' in sum_data
    results['Combined Summary API'] = 'PASS'

    # Test 5: Legacy GET /api/reports/ backward compatibility
    res_leg = client1.get('/api/reports/')
    assert res_leg.status_code == 200, f"Legacy /api/reports/ failed: {res_leg.data}"
    assert 'income' in res_leg.data and 'expenses' in res_leg.data
    results['Legacy Endpoint /api/reports/'] = 'PASS'

    # Test 6: Date Filters
    res_prev = client1.get('/api/reports/monthly/?period=previous_month')
    assert res_prev.status_code == 200
    res_custom = client1.get(f'/api/reports/expenses/?start_date={today.isoformat()}&end_date={today.isoformat()}')
    assert res_custom.status_code == 200
    results['Date Filters'] = 'PASS'

    # Test 7: Export JSON
    res_exp = client1.get('/api/reports/export/?format=json')
    assert res_exp.status_code == 200
    results['Export JSON API'] = 'PASS'

    # Test 8: User Isolation
    res_u2 = client2.get('/api/reports/monthly/')
    assert res_u2.status_code == 200
    assert res_u2.data['total_income'] == 9999.0, "User 2 data leaked or wrong"
    assert res_u2.data['total_expense'] == 8888.0, "User 2 expense leaked or wrong"
    results['User Isolation'] = 'PASS'

    # Test 9: Unauthenticated request should fail
    client_anon = APIClient()
    res_anon = client_anon.get('/api/reports/summary/')
    assert res_anon.status_code == 401, f"Expected 401 Unauthorized, got {res_anon.status_code}"
    results['JWT Authentication Enforcement'] = 'PASS'

    print("\n--- ALL BACKEND REPORT VERIFICATION TESTS PASSED ---")
    for k, v in results.items():
        print(f"[PASS] {k}: {v}")

if __name__ == '__main__':
    run_tests()
