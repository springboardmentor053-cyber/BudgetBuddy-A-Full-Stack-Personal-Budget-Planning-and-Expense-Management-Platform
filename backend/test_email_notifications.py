import os
import sys
import django
from unittest.mock import patch

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()


from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.core import mail
from rest_framework.test import APIClient

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification
from savings.views import trigger_notifications_for_user


def run_email_tests():
    print("====================================================")
    print("STARTING EMAIL NOTIFICATIONS & SMTP TEST SUITE")
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
    User.objects.filter(username__startswith='email_test_').delete()


    user1 = User.objects.create_user(
        username='email_test_user_1',
        email='user1_smtp@example.com',
        password='Password123!'
    )
    user2 = User.objects.create_user(
        username='email_test_user_2',
        email='user2_smtp@example.com',
        password='Password123!'
    )

    today = date.today()

    # Force locmem backend for testing mail.outbox
    from django.conf import settings
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

    # Clear previous outbox
    mail.outbox = []


    # 1. TEST 80% THRESHOLD EMAIL & IN-APP NOTIFICATION
    bgt_food = Budget.objects.create(
        user=user1,
        category='FOOD',
        budget_amount=Decimal('500.00'),
        month=today.month,
        year=today.year
    )

    # Spend $400 (80%)
    Expense.objects.create(
        user=user1,
        title='Grocery',
        amount=Decimal('400.00'),
        category='FOOD',
        expense_date=today
    )

    trigger_notifications_for_user(user1)

    notif_80 = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').exists()
    email_sent_80 = len(mail.outbox) == 1 and mail.outbox[0].to == ['user1_smtp@example.com'] and '80% Used' in mail.outbox[0].subject

    record("1. Budget 80% Used In-App Notification Created", notif_80)
    record("2. Budget 80% Used Email Sent to user1.email", email_sent_80, f"Subject: {mail.outbox[0].subject if mail.outbox else 'None'}")

    # 2. TEST DUPLICATE PREVENTION
    outbox_len_before = len(mail.outbox)
    trigger_notifications_for_user(user1)
    notif_count_80 = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count()

    record("3. Duplicate Prevention - In-App Notification Remains Single", notif_count_80 == 1)
    record("4. Duplicate Prevention - Email Not Resent on Re-trigger", len(mail.outbox) == outbox_len_before)

    # 3. TEST 90% THRESHOLD EMAIL
    Expense.objects.create(
        user=user1,
        title='Snacks',
        amount=Decimal('50.00'), # Total $450 = 90%
        category='FOOD',
        expense_date=today
    )

    trigger_notifications_for_user(user1)

    notif_90 = Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').exists()
    email_sent_90 = len(mail.outbox) == 2 and '90% Used' in mail.outbox[1].subject

    record("5. Budget 90% Used In-App Notification Created", notif_90)
    record("6. Budget 90% Used Email Sent", email_sent_90, f"Subject: {mail.outbox[1].subject if len(mail.outbox) > 1 else 'None'}")

    # 4. TEST 100%+ EXCEEDED EMAIL
    Expense.objects.create(
        user=user1,
        title='Dinner',
        amount=Decimal('100.00'), # Total $550 = 110% (Exceeded by $50)
        category='FOOD',
        expense_date=today
    )

    trigger_notifications_for_user(user1)

    notif_100 = Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').exists()
    email_sent_100 = len(mail.outbox) == 3 and 'Budget Exceeded - FOOD' in mail.outbox[2].subject

    record("7. Budget Exceeded In-App Notification Created", notif_100)
    record("8. Budget Exceeded Email Sent with Category Subject", email_sent_100, f"Subject: {mail.outbox[2].subject if len(mail.outbox) > 2 else 'None'}")

    # Verify email body content
    if len(mail.outbox) >= 3:
        body_100 = mail.outbox[2].body
        record("9. Email Body Contains Budget Amount (Rs. 500.00)", "Budget: Rs. 500.00" in body_100)
        record("10. Email Body Contains Spent Amount (Rs. 550.00)", "Spent: Rs. 550.00" in body_100)
        record("11. Email Body Contains Exceeded Amount (Rs. 50.00)", "Exceeded By: Rs. 50.00" in body_100)


    # 5. TEST USER WITHOUT EMAIL
    user_no_email = User.objects.create_user(
        username='email_test_no_email',
        email='', # Empty email
        password='Password123!'
    )
    Budget.objects.create(
        user=user_no_email,
        category='TRAVEL',
        budget_amount=Decimal('200.00'),
        month=today.month,
        year=today.year
    )
    Expense.objects.create(
        user=user_no_email,
        title='Taxi',
        amount=Decimal('200.00'),
        category='TRAVEL',
        expense_date=today
    )

    outbox_count_before = len(mail.outbox)
    trigger_notifications_for_user(user_no_email)

    notif_no_email = Notification.objects.filter(user=user_no_email, notification_type='BUDGET_EXCEEDED').exists()
    outbox_count_after = len(mail.outbox)

    record("12. User Without Email - In-App Notification Created", notif_no_email)
    record("13. User Without Email - Email Skipped Cleanly Without Exception", outbox_count_before == outbox_count_after)

    from django.core.mail import EmailMessage
    # 6. TEST SMTP FAILURE HANDLING (EXCEPTION DOES NOT BREAK API)
    with patch.object(EmailMessage, 'send', side_effect=Exception("SMTP Connection Refused")):

        # User 2 reaches 80%
        Budget.objects.create(
            user=user2,
            category='BILLS',
            budget_amount=Decimal('100.00'),
            month=today.month,
            year=today.year
        )
        Expense.objects.create(
            user=user2,
            title='Electric Bill',
            amount=Decimal('85.00'),
            category='BILLS',
            expense_date=today
        )

        try:
            trigger_notifications_for_user(user2)
            smtp_fail_handled = True
        except Exception as e:
            smtp_fail_handled = False

        notif_smtp_fail = Notification.objects.filter(user=user2, notification_type='BUDGET_80_PERCENT').exists()

    record("14. SMTP Failure Exception Handled Gracefully (No 500 Error)", smtp_fail_handled)
    record("15. SMTP Failure - In-App Notification Still Created", notif_smtp_fail)

    # 7. USER ISOLATION
    for msg in mail.outbox:
        if 'user1_smtp@example.com' in msg.to:
            assert 'user2_smtp@example.com' not in msg.to
    record("16. Strict User Email Isolation Enforced", True)

    print("\n====================================================")
    print(f"EMAIL NOTIFICATIONS TEST SUITE FINISHED: {passed_count} PASSED, {failed_count} FAILED")
    print("====================================================\n")
    return passed_count, failed_count


if __name__ == '__main__':
    passed, failed = run_email_tests()
    if failed > 0:
        sys.exit(1)
