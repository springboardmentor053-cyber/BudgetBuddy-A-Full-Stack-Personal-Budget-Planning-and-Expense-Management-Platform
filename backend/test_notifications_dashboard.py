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
from rest_framework import status

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification


def run_notifications_dashboard_tests():
    print("====================================================")
    print("STARTING NOTIFICATIONS & DASHBOARD AUTOMATED TESTS")
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

    # Setup test users
    User.objects.filter(username__startswith='notif_test_').delete()

    user1 = User.objects.create_user(username='notif_test_user_1', email='user1@example.com', password='Password123!')
    user2 = User.objects.create_user(username='notif_test_user_2', email='user2@example.com', password='Password123!')

    client1 = APIClient()
    res1 = client1.post('/api/login/', {'username': 'notif_test_user_1', 'password': 'Password123!'})
    token1 = res1.data['access']
    client1.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')

    client2 = APIClient()
    res2 = client2.post('/api/login/', {'username': 'notif_test_user_2', 'password': 'Password123!'})
    token2 = res2.data['access']
    client2.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')

    today = date.today()

    # 1. BUDGET CREATED NOTIFICATION
    res_bgt = client1.post('/api/budgets/', {
        'category': 'FOOD',
        'budget_amount': '500.00',
        'month': today.month,
        'year': today.year
    })
    record("1. Budget Created API Status 201", res_bgt.status_code == status.HTTP_201_CREATED)

    notif_bgt_created = Notification.objects.filter(user=user1, notification_type='BUDGET_CREATED').first()
    record("2. BUDGET_CREATED Notification Created (Priority MEDIUM)", notif_bgt_created and notif_bgt_created.priority == 'MEDIUM')

    # 2. EXPENSE CREATED NOTIFICATION
    res_exp1 = client1.post('/api/expenses/', {
        'title': 'Lunch',
        'amount': '300.00', # 60% - below 80%
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("3. Expense Created API Status 201", res_exp1.status_code == status.HTTP_201_CREATED)

    notif_exp_created = Notification.objects.filter(user=user1, notification_type='EXPENSE_ADDED').first()
    record("4. EXPENSE_ADDED Notification Created", notif_exp_created is not None)

    # Verify no 80% alert yet
    notif_80_before = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').exists()
    record("5. No 80% Alert Triggered at 60% Utilization", not notif_80_before)

    # 3. EXPENSE REACHES 80% (Spend +$100 = $400/500 = 80%)
    res_exp2 = client1.post('/api/expenses/', {
        'title': 'Groceries',
        'amount': '100.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("6. Add Expense to Reach 80% Utilization", res_exp2.status_code == status.HTTP_201_CREATED)

    notif_80 = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').first()
    record("7. BUDGET_80_PERCENT Notification Created (Priority LOW)", notif_80 and notif_80.priority == 'LOW')

    # 4. EXPENSE REACHES 90% (Spend +$50 = $450/500 = 90%)
    res_exp3 = client1.post('/api/expenses/', {
        'title': 'Coffee & Snacks',
        'amount': '50.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("8. Add Expense to Reach 90% Utilization", res_exp3.status_code == status.HTTP_201_CREATED)

    notif_90 = Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').first()
    record("9. BUDGET_90_PERCENT Notification Created (Priority MEDIUM)", notif_90 and notif_90.priority == 'MEDIUM')

    # 5. EXPENSE REACHES 100%+ (Spend +$60 = $510/500 = 102%)
    res_exp4 = client1.post('/api/expenses/', {
        'title': 'Dinner Party',
        'amount': '60.00',
        'category': 'FOOD',
        'expense_date': today.isoformat()
    })
    record("10. Add Expense to Exceed Budget (102% Utilization)", res_exp4.status_code == status.HTTP_201_CREATED)

    notif_100 = Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').first()
    record("11. BUDGET_EXCEEDED Notification Created (Priority HIGH)", notif_100 and notif_100.priority == 'HIGH')

    # 6. DUPLICATE PREVENTION
    res_notif_list = client1.get('/api/notifications/')
    record("12. Notification List API Fetch (Status 200)", res_notif_list.status_code == status.HTTP_200_OK)

    count_80 = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count()
    count_90 = Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').count()
    count_100 = Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').count()

    record("13. Deterministic Deduplication - Exactly 1 BUDGET_80_PERCENT", count_80 == 1)
    record("14. Deterministic Deduplication - Exactly 1 BUDGET_90_PERCENT", count_90 == 1)
    record("15. Deterministic Deduplication - Exactly 1 BUDGET_EXCEEDED", count_100 == 1)

    # 7. UNREAD COUNT API
    res_unread = client1.get('/api/notifications/unread-count/')
    record("16. Unread Notification Count API Fetch (Status 200)", res_unread.status_code == status.HTTP_200_OK)
    unread_val = res_unread.data.get('unread_count')
    total_unread_db = Notification.objects.filter(user=user1, is_read=False).count()
    record("17. Unread Count Matches Database Count", unread_val == total_unread_db)

    # Mark all as read
    res_mark_all = client1.patch('/api/notifications/mark-all-read/')
    record("18. Mark All Notifications as Read API (Status 200)", res_mark_all.status_code == status.HTTP_200_OK)
    res_unread_after = client1.get('/api/notifications/unread-count/')
    record("19. Unread Count Decreases to 0 After Mark All Read", res_unread_after.data.get('unread_count') == 0)

    # 8. USER ISOLATION
    res_notif_user2 = client2.get('/api/notifications/')
    user2_notifs = res_notif_user2.data
    has_user1_notif = any(n['id'] in [n1.id for n1 in Notification.objects.filter(user=user1)] for n in user2_notifs)
    record("20. User Isolation Rejects User 2 Accessing User 1 Notifications", not has_user1_notif)

    # 9. DASHBOARD API
    res_dash = client1.get('/api/dashboard/')
    record("21. Dashboard Overview API (Status 200)", res_dash.status_code == status.HTTP_200_OK)
    record("22. Dashboard Contains Notifications Array", 'latest_notifications' in res_dash.data)


    # 10. REPORTS & EXPORTS
    res_rpt = client1.get('/api/reports/summary/')
    record("23. Financial Report API (Status 200)", res_rpt.status_code == status.HTTP_200_OK)

    res_pdf = client1.get('/api/reports/export/pdf/')
    record("24. PDF Report Export Download (application/pdf)", res_pdf.status_code == status.HTTP_200_OK and res_pdf['Content-Type'] == 'application/pdf')

    res_excel = client1.get('/api/reports/export/excel/')
    record("25. Excel Report Export Download (spreadsheetml.sheet)", res_excel.status_code == status.HTTP_200_OK and 'spreadsheetml' in res_excel['Content-Type'])

    res_json = client1.get('/api/reports/export/?format=json')
    record("26. JSON Report Export Download (application/json)", res_json.status_code == status.HTTP_200_OK and 'application/json' in res_json['Content-Type'])


    print("\n====================================================")
    print(f"NOTIFICATIONS & DASHBOARD TEST SUITE FINISHED: {passed_count} PASSED, {failed_count} FAILED")
    print("====================================================\n")
    return passed_count, failed_count


if __name__ == '__main__':
    passed, failed = run_notifications_dashboard_tests()
    if failed > 0:
        sys.exit(1)
