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
    print("Starting Comprehensive Notification & Dashboard Fix Verification...")

    # 1. Setup Test Users
    user1, _ = User.objects.get_or_create(username='notif_test_user1', email='notif1@example.com')
    user1.set_password('TestPass123!')
    user1.save()

    user2, _ = User.objects.get_or_create(username='notif_test_user2', email='notif2@example.com')
    user2.set_password('TestPass123!')
    user2.save()

    # Clean data for test users
    Expense.objects.filter(user__in=[user1, user2]).delete()
    Income.objects.filter(user__in=[user1, user2]).delete()
    Budget.objects.filter(user__in=[user1, user2]).delete()
    SavingsGoal.objects.filter(user__in=[user1, user2]).delete()
    Notification.objects.filter(user__in=[user1, user2]).delete()

    client1 = APIClient()
    token1 = str(RefreshToken.for_user(user1).access_token)
    client1.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')

    client2 = APIClient()
    token2 = str(RefreshToken.for_user(user2).access_token)
    client2.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')

    today = date.today()
    curr_m = today.month
    curr_y = today.year

    results = {}

    # TEST A: Income CRUD Notifications
    res_inc_create = client1.post('/api/income/', {
        'source': 'Salary', 'amount': '5000.00', 'income_date': today.isoformat(), 'description': 'Monthly salary'
    }, format='json')
    assert res_inc_create.status_code == 201
    inc_id = res_inc_create.data['id']
    assert Notification.objects.filter(user=user1, notification_type='INCOME_ADDED').count() == 1

    res_inc_update = client1.put(f'/api/income/{inc_id}/', {
        'source': 'Updated Salary', 'amount': '5500.00', 'income_date': today.isoformat(), 'description': 'Updated'
    }, format='json')
    assert res_inc_update.status_code == 200
    assert Notification.objects.filter(user=user1, notification_type='INCOME_UPDATED').count() == 1

    res_inc_del = client1.delete(f'/api/income/{inc_id}/')
    assert res_inc_del.status_code == 204
    assert Notification.objects.filter(user=user1, notification_type='INCOME_DELETED').count() == 1
    results['Income CRUD Notifications'] = 'PASS'

    # Re-create income for dashboard
    client1.post('/api/income/', {'source': 'Salary', 'amount': '5000.00', 'income_date': today.isoformat()}, format='json')

    # TEST B: Budget CRUD Notifications
    res_bgt_create = client1.post('/api/budgets/', {
        'category': 'FOOD', 'budget_amount': '1000.00', 'month': curr_m, 'year': curr_y
    }, format='json')
    assert res_bgt_create.status_code == 201
    bgt_id = res_bgt_create.data['id']
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_CREATED').count() == 1

    res_bgt_update = client1.put(f'/api/budgets/{bgt_id}/', {
        'category': 'FOOD', 'budget_amount': '1000.00', 'month': curr_m, 'year': curr_y
    }, format='json')
    assert res_bgt_update.status_code == 200
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_UPDATED').count() == 1
    results['Budget CRUD Notifications'] = 'PASS'

    # TEST C: Threshold Notifications & Deduplication (80%, 90%, 100%)
    # Budget is 1000.00.
    # Step 1: Add 790 expense (79%) -> NO budget limit notification yet
    client1.post('/api/expenses/', {'title': 'Dinner 1', 'amount': '790.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count() == 0

    # Step 2: Add 30 expense (820 total, 82%) -> EXACTLY ONE 80% notification
    client1.post('/api/expenses/', {'title': 'Dinner 2', 'amount': '30.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count() == 1
    # Adding another small expense (830 total) should NOT create duplicate 80% notification
    client1.post('/api/expenses/', {'title': 'Snack', 'amount': '10.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count() == 1
    results['Budget 80% Threshold & Deduplication'] = 'PASS'

    # Step 3: Add 80 expense (910 total, 91%) -> EXACTLY ONE 90% notification
    client1.post('/api/expenses/', {'title': 'Lunch', 'amount': '80.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').count() == 1
    # Add another small expense (920 total) -> still 1
    client1.post('/api/expenses/', {'title': 'Coffee', 'amount': '10.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').count() == 1
    results['Budget 90% Threshold & Deduplication'] = 'PASS'

    # Step 4: Add 100 expense (1020 total, 102%) -> EXACTLY ONE 100% Exceeded notification
    client1.post('/api/expenses/', {'title': 'Feast', 'amount': '100.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').count() == 1
    # Add another expense -> still 1
    client1.post('/api/expenses/', {'title': 'More Food', 'amount': '20.00', 'category': 'FOOD', 'expense_date': today.isoformat()}, format='json')
    assert Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').count() == 1
    results['Budget 100% Exceeded & Deduplication'] = 'PASS'

    # TEST D: Savings Notifications & Priorities
    res_sav_create = client1.post('/api/savings/', {
        'goal_name': 'Laptop', 'target_amount': '1000.00', 'saved_amount': '0.00', 'target_date': (today + timedelta(days=60)).isoformat(), 'status': 'ACTIVE'
    }, format='json')
    assert res_sav_create.status_code == 201
    sav_id = res_sav_create.data['id']
    assert Notification.objects.filter(user=user1, notification_type='GOAL_CREATED', priority='MEDIUM').count() == 1

    # Update to 850 (85%)
    client1.put(f'/api/savings/{sav_id}/', {
        'goal_name': 'Laptop', 'target_amount': '1000.00', 'saved_amount': '850.00', 'target_date': (today + timedelta(days=60)).isoformat(), 'status': 'ACTIVE'
    }, format='json')
    assert Notification.objects.filter(user=user1, notification_type='GOAL_80_PERCENT', priority='LOW').count() == 1

    # Update to 1000 (100% / Completed)
    client1.put(f'/api/savings/{sav_id}/', {
        'goal_name': 'Laptop', 'target_amount': '1000.00', 'saved_amount': '1000.00', 'target_date': (today + timedelta(days=60)).isoformat(), 'status': 'COMPLETED'
    }, format='json')
    assert Notification.objects.filter(user=user1, notification_type='GOAL_ACHIEVED', priority='HIGH').count() == 1
    results['Savings Notifications & Priorities'] = 'PASS'

    # TEST E: Expanded Dashboard API
    res_dash = client1.get('/api/dashboard/')
    assert res_dash.status_code == 200
    d = res_dash.data
    assert 'financial_summary' in d and 'category_breakdown' in d and 'monthly_expenses' in d and 'recent_transactions' in d and 'latest_notifications' in d and 'active_savings_goals' in d
    assert len(d['latest_notifications']) <= 5
    results['Expanded Dashboard API'] = 'PASS'

    # TEST F: Reports Stability
    res_rep_m = client1.get('/api/reports/monthly/')
    assert res_rep_m.status_code == 200
    res_rep_e = client1.get('/api/reports/expenses/')
    assert res_rep_e.status_code == 200
    res_rep_s = client1.get('/api/reports/savings/')
    assert res_rep_s.status_code == 200
    res_rep_sum = client1.get('/api/reports/summary/')
    assert res_rep_sum.status_code == 200
    results['Reports API Stability'] = 'PASS'

    # TEST G: User Isolation
    res_u2_dash = client2.get('/api/dashboard/')
    assert res_u2_dash.status_code == 200
    assert res_u2_dash.data['financial_summary']['total_income'] == 0.0
    assert len(res_u2_dash.data['latest_notifications']) == 0
    results['User Isolation'] = 'PASS'

    print("\n--- ALL BACKEND TEST VERIFICATIONS PASSED ---")
    for k, v in results.items():
        print(f"[PASS] {k}: {v}")

if __name__ == '__main__':
    run_tests()
