import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.core import mail
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework import status

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification


def run_issue11_tests():
    print("====================================================")
    print("STARTING ISSUE 11 STEP-BY-STEP THRESHOLD & EMAIL SUITE")
    print("====================================================\n")

    passed_count = 0
    failed_count = 0

    def record(test_name, success, details=""):
        nonlocal passed_count, failed_count
        if success:
            passed_count += 1
            print(f"[PASS] {test_name} {f'({details})' if details else ''}")
        else:
            failed_count += 1
            print(f"[FAIL] {test_name} {f'({details})' if details else ''}")

    # Use locmem for outbox verification
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    mail.outbox = []

    # Setup clean test user
    User.objects.filter(username='step_test_user').delete()
    user = User.objects.create_user(
        username='step_test_user',
        email='step_user@example.com',
        password='Password123!'
    )

    client = APIClient()
    res_login = client.post('/api/login/', {'username': 'step_test_user', 'password': 'Password123!'})
    token = res_login.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    today = date.today()

    # Create FOOD budget = 500
    res_bgt = client.post('/api/budgets/', {
        'category': 'FOOD',
        'budget_amount': '500.00',
        'month': today.month,
        'year': today.year
    })
    record("0. Budget Created ($500.00)", res_bgt.status_code == status.HTTP_201_CREATED)

    # STEP 1: Add Expense = 400 (80%)
    res_e1 = client.post('/api/expenses/', {
        'title': 'Grocery 400',
        'amount': '400.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("Step 1: Add Expense $400.00 (Status 201)", res_e1.status_code == status.HTTP_201_CREATED)

    notif_80 = Notification.objects.filter(user=user, notification_type='BUDGET_80_PERCENT').first()
    record("Step 1: BUDGET_80_PERCENT Notification Exists (Priority LOW)", notif_80 and notif_80.priority == 'LOW')

    email_80_sent = len(mail.outbox) >= 1 and any('80% Used' in msg.subject for msg in mail.outbox)
    record("Step 1: 80% Alert Email Sent", email_80_sent)

    unread_step1 = client.get('/api/notifications/unread-count/').data.get('unread_count')
    record("Step 1: Unread Count is Accurate", unread_step1 > 0)

    # STEP 2: Add Expense = 50 (Total 450 = 90%)
    outbox_len_before_step2 = len(mail.outbox)
    res_e2 = client.post('/api/expenses/', {
        'title': 'Snacks 50',
        'amount': '50.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("Step 2: Add Expense $50.00 (Total $450 = 90%)", res_e2.status_code == status.HTTP_201_CREATED)

    notif_90 = Notification.objects.filter(user=user, notification_type='BUDGET_90_PERCENT').first()
    record("Step 2: BUDGET_90_PERCENT Notification Exists (Priority MEDIUM)", notif_90 and notif_90.priority == 'MEDIUM')

    email_90_sent = len(mail.outbox) > outbox_len_before_step2 and any('90% Used' in msg.subject for msg in mail.outbox)
    record("Step 2: 90% Alert Email Sent", email_90_sent)

    # STEP 3: Add Expense = 5 (Total 455 = 91%)
    count_90_before_step3 = Notification.objects.filter(user=user, notification_type='BUDGET_90_PERCENT').count()
    outbox_len_before_step3 = len(mail.outbox)

    res_e3 = client.post('/api/expenses/', {
        'title': 'Candy 5',
        'amount': '5.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("Step 3: Add Expense $5.00 (Total $455 = 91%)", res_e3.status_code == status.HTTP_201_CREATED)

    count_90_after_step3 = Notification.objects.filter(user=user, notification_type='BUDGET_90_PERCENT').count()
    record("Step 3: NO Duplicate 90% Notification Created (Count Remains 1)", count_90_before_step3 == count_90_after_step3 == 1)

    outbox_len_after_step3 = len(mail.outbox)
    record("Step 3: NO Duplicate 90% Email Sent (Outbox Count Unchanged)", outbox_len_before_step3 == outbox_len_after_step3)

    # STEP 4: Add Expense = 45 (Total 500 = 100%)
    outbox_len_before_step4 = len(mail.outbox)
    res_e4 = client.post('/api/expenses/', {
        'title': 'Lunch 45',
        'amount': '45.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("Step 4: Add Expense $45.00 (Total $500 = 100%)", res_e4.status_code == status.HTTP_201_CREATED)

    notif_100 = Notification.objects.filter(user=user, notification_type='BUDGET_EXCEEDED').first()
    record("Step 4: BUDGET_EXCEEDED Notification Exists (Priority HIGH)", notif_100 and notif_100.priority == 'HIGH')

    email_100_sent = len(mail.outbox) > outbox_len_before_step4 and any('Budget Exceeded - FOOD' in msg.subject for msg in mail.outbox)
    record("Step 4: Budget Exceeded Email Sent", email_100_sent)

    # STEP 5: Add Expense = 50 (Total 550 = 110%)
    count_100_before_step5 = Notification.objects.filter(user=user, notification_type='BUDGET_EXCEEDED').count()
    outbox_len_before_step5 = len(mail.outbox)

    res_e5 = client.post('/api/expenses/', {
        'title': 'Dinner 50',
        'amount': '50.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("Step 5: Add Expense $50.00 (Total $550 = 110%)", res_e5.status_code == status.HTTP_201_CREATED)

    count_100_after_step5 = Notification.objects.filter(user=user, notification_type='BUDGET_EXCEEDED').count()
    record("Step 5: NO Duplicate BUDGET_EXCEEDED Notification Created (Count Remains 1)", count_100_before_step5 == count_100_after_step5 == 1)

    outbox_len_after_step5 = len(mail.outbox)
    record("Step 5: NO Duplicate BUDGET_EXCEEDED Email Sent (Outbox Count Unchanged)", outbox_len_before_step5 == outbox_len_after_step5)

    print("\n====================================================")
    print(f"ISSUE 11 STEP-BY-STEP TEST SUITE FINISHED: {passed_count} PASSED, {failed_count} FAILED")
    print("====================================================\n")
    return passed_count, failed_count


if __name__ == '__main__':
    passed, failed = run_issue11_tests()
    if failed > 0:
        sys.exit(1)
