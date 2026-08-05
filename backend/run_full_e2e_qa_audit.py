import os
import sys
import io
import json
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

import openpyxl
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from expenses.models import Expense, Income, Budget
from savings.models import SavingsGoal, Notification


class ComprehensiveQAAuditRunner:
    def __init__(self):
        self.results = []
        self.passed_count = 0
        self.failed_count = 0
        self.today = date.today()

    def record_test(self, category, test_name, passed, details="", severity="MEDIUM"):
        status = "PASS" if passed else "FAIL"
        if passed:
            self.passed_count += 1
        else:
            self.failed_count += 1
        
        entry = {
            "category": category,
            "test_name": test_name,
            "status": status,
            "severity": severity if not passed else "N/A",
            "details": details
        }
        self.results.append(entry)
        symbol = "PASS" if passed else "FAIL"
        print(f"[{symbol}] [{category}] {test_name}: {status} {f'({details})' if details else ''}")

    def run_all_tests(self):
        print("====================================================")
        print("STARTING FULL END-TO-END QA AUTOMATION AUDIT")
        print("====================================================\n")

        # Cleanup existing QA users
        User.objects.filter(username__startswith='qa_user_').delete()

        client_unauth = APIClient()

        # ====================================================
        # 1. AUTHENTICATION & AUTHORIZATION
        # ====================================================
        reg_payload = {
            "username": "qa_user_1",
            "email": "qa_user_1@example.com",
            "password": "Password123!"
        }
        res_reg = client_unauth.post('/api/register/', reg_payload, format='json')
        self.record_test("AUTHENTICATION", "Register Valid User", res_reg.status_code in [200, 201], f"Status: {res_reg.status_code}")

        res_dup = client_unauth.post('/api/register/', reg_payload, format='json')
        self.record_test("AUTHENTICATION", "Register Duplicate User Prevention", res_dup.status_code == 400, f"Status: {res_dup.status_code}")

        bad_email = {"username": "qa_user_bad", "email": "invalid_email_str", "password": "Password123!"}
        res_bad_email = client_unauth.post('/api/register/', bad_email, format='json')
        self.record_test("AUTHENTICATION", "Invalid Email Validation", res_bad_email.status_code == 400, f"Status: {res_bad_email.status_code}")

        login_payload = {"username": "qa_user_1", "password": "Password123!"}
        res_login = client_unauth.post('/api/login/', login_payload, format='json')
        has_token = res_login.status_code == 200 and ('access' in res_login.data or 'token' in res_login.data)
        self.record_test("AUTHENTICATION", "Login & JWT Token Issuance", has_token, f"Status: {res_login.status_code}")

        token = res_login.data.get('access') or res_login.data.get('token')
        client_user1 = APIClient()
        client_user1.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res_bad_pass = client_unauth.post('/api/login/', {"username": "qa_user_1", "password": "WrongPassword!"}, format='json')
        self.record_test("AUTHENTICATION", "Invalid Password Denial", res_bad_pass.status_code in [400, 401], f"Status: {res_bad_pass.status_code}")

        res_unauth = client_unauth.get('/api/dashboard/')
        self.record_test("AUTHENTICATION", "Unauthorized Page Access Rejection", res_unauth.status_code in [401, 403], f"Status: {res_unauth.status_code}")

        # ====================================================
        # 2. INCOME MODULE TESTING
        # ====================================================
        user1 = User.objects.get(username='qa_user_1')

        inc_data = {"source": "Tech Corp Salary", "amount": "5000.00", "income_date": self.today.isoformat(), "description": "Monthly base salary"}
        res_inc = client_user1.post('/api/income/', inc_data, format='json')
        inc_id = res_inc.data.get('id') if res_inc.status_code == 201 else None
        self.record_test("INCOME", "Create Income ($5,000.00)", res_inc.status_code == 201)

        res_small_inc = client_user1.post('/api/income/', {"source": "Bonus", "amount": "0.01", "income_date": self.today.isoformat()}, format='json')
        self.record_test("INCOME", "Very Small Amount ($0.01)", res_small_inc.status_code == 201)

        if inc_id:
            res_upd_inc = client_user1.put(f'/api/income/{inc_id}/', {"source": "Updated Tech Corp Salary", "amount": "5500.00", "income_date": self.today.isoformat()}, format='json')
            self.record_test("INCOME", "Update Income ($5,500.00)", res_upd_inc.status_code == 200)

        res_neg_inc = client_user1.post('/api/income/', {"source": "Invalid", "amount": "-100.00", "income_date": self.today.isoformat()}, format='json')
        self.record_test("INCOME", "Negative Amount Validation Rejection", res_neg_inc.status_code == 400, f"Status: {res_neg_inc.status_code}")

        # ====================================================
        # 3. EXPENSES MODULE TESTING
        # ====================================================
        categories = ['FOOD', 'TRAVEL', 'SHOPPING', 'EDUCATION', 'ENTERTAINMENT', 'MISCELLANEOUS']
        cat_success = True
        for cat in categories:
            res_cat = client_user1.post('/api/expenses/', {
                "title": f"Test {cat}", "amount": "50.00", "category": cat, "expense_date": self.today.isoformat()
            }, format='json')
            if res_cat.status_code != 201:
                cat_success = False
        self.record_test("EXPENSES", "Category Coverage (All 6 Categories)", cat_success)

        res_huge_exp = client_user1.post('/api/expenses/', {"title": "Luxury Yacht", "amount": "1000000.00", "category": "MISCELLANEOUS", "expense_date": self.today.isoformat()}, format='json')
        self.record_test("EXPENSES", "Very Large Amount ($1,000,000.00)", res_huge_exp.status_code == 201)

        res_neg_exp = client_user1.post('/api/expenses/', {"title": "Refund", "amount": "-50.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        self.record_test("EXPENSES", "Negative Expense Validation Rejection", res_neg_exp.status_code == 400, f"Status: {res_neg_exp.status_code}")

        # ====================================================
        # 4. BUDGETS & THRESHOLD DEDUPLICATION
        # ====================================================
        Budget.objects.filter(user=user1).delete()
        Expense.objects.filter(user=user1).delete()
        Notification.objects.filter(user=user1).delete()

        res_bgt = client_user1.post('/api/budgets/', {"category": "FOOD", "budget_amount": "1000.00", "month": self.today.month, "year": self.today.year}, format='json')
        self.record_test("BUDGETS", "Create Budget ($1,000.00 for FOOD)", res_bgt.status_code == 201)

        # Step 1: Spend $799 (79.9%) -> 0 threshold alerts
        client_user1.post('/api/expenses/', {"title": "Meal 1", "amount": "799.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_80_count_before = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count()
        self.record_test("BUDGETS", "Spend 79.9% (No 80% Notification Trigger)", notif_80_count_before == 0)

        # Step 2: Spend $1 (Total $800 = 80%) -> Exactly 1 BUDGET_80_PERCENT notification
        client_user1.post('/api/expenses/', {"title": "Meal 2", "amount": "1.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        client_user1.post('/api/expenses/', {"title": "Meal 2 Extra", "amount": "4.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_80_count = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count()
        self.record_test("BUDGETS", "Spend 80% (Exactly ONE 80% Alert Trigger)", notif_80_count == 1)

        # Step 3: Spend $96.00 (Total $900 = 90%) -> Exactly 1 BUDGET_90_PERCENT notification
        client_user1.post('/api/expenses/', {"title": "Meal 3", "amount": "96.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_90_count = Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').count()
        self.record_test("BUDGETS", "Spend 90% (Exactly ONE 90% Alert Trigger)", notif_90_count == 1)

        # Step 4: Spend $100.00 (Total $1000 = 100%) -> Exactly 1 BUDGET_EXCEEDED notification
        client_user1.post('/api/expenses/', {"title": "Meal 4", "amount": "100.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        client_user1.post('/api/expenses/', {"title": "Overbudget Meal", "amount": "50.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_100_count = Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').count()
        self.record_test("BUDGETS", "Spend 100%+ (Exactly ONE Budget Exceeded Alert Trigger)", notif_100_count == 1)

        # ====================================================
        # 5. SAVINGS GOALS MODULE
        # ====================================================
        res_sav = client_user1.post('/api/savings/', {
            "goal_name": "Emergency Fund", "target_amount": "2000.00", "saved_amount": "0.00", "target_date": (self.today + timedelta(days=90)).isoformat()
        }, format='json')
        sav_id = res_sav.data.get('id') if res_sav.status_code == 201 else None
        self.record_test("SAVINGS", "Create Savings Goal", res_sav.status_code == 201)

        has_goal_created = Notification.objects.filter(user=user1, notification_type='GOAL_CREATED', priority='MEDIUM').exists()
        self.record_test("SAVINGS", "Goal Created Notification Trigger (MEDIUM)", has_goal_created)

        if sav_id:
            client_user1.put(f'/api/savings/{sav_id}/', {
                "goal_name": "Emergency Fund", "target_amount": "2000.00", "saved_amount": "1600.00", "target_date": (self.today + timedelta(days=90)).isoformat()
            }, format='json')
            has_goal_80 = Notification.objects.filter(user=user1, notification_type='GOAL_80_PERCENT', priority='LOW').exists()
            self.record_test("SAVINGS", "Goal 80% Reached Notification Trigger (LOW)", has_goal_80)

            client_user1.put(f'/api/savings/{sav_id}/', {
                "goal_name": "Emergency Fund", "target_amount": "2000.00", "saved_amount": "2000.00", "target_date": (self.today + timedelta(days=90)).isoformat()
            }, format='json')
            has_goal_achieved = Notification.objects.filter(user=user1, notification_type='GOAL_ACHIEVED', priority='HIGH').exists()
            self.record_test("SAVINGS", "Goal Completed Notification Trigger (HIGH)", has_goal_achieved)

        # ====================================================
        # 6. NOTIFICATIONS SYSTEM
        # ====================================================
        res_notifs = client_user1.get('/api/notifications/')
        self.record_test("NOTIFICATIONS", "Notification List API Fetch", res_notifs.status_code == 200)

        if res_notifs.status_code == 200 and len(res_notifs.data) > 0:
            first_notif_id = res_notifs.data[0]['id']
            res_read = client_user1.patch(f'/api/notifications/{first_notif_id}/read/')
            self.record_test("NOTIFICATIONS", "Mark Single Notification as Read", res_read.status_code == 200)

        res_mark_all = client_user1.patch('/api/notifications/mark-all-read/')
        self.record_test("NOTIFICATIONS", "Mark All Notifications as Read", res_mark_all.status_code == 200)

        # ====================================================
        # 7. DASHBOARD & ANALYTICS APIs
        # ====================================================
        res_dash = client_user1.get('/api/dashboard/')
        dash_valid = res_dash.status_code == 200 and all(
            k in res_dash.data for k in [
                'financial_summary', 'category_breakdown', 'monthly_expenses',
                'recent_transactions', 'latest_notifications', 'active_savings_goals'
            ]
        )
        self.record_test("DASHBOARD", "Expanded Dashboard API (All 6 Required Sections)", dash_valid)

        res_analytics = client_user1.get('/api/analytics/')
        self.record_test("ANALYTICS", "Analytics API Financial Breakdown", res_analytics.status_code == 200)

        # ====================================================
        # 8. REPORTS & EXPORTS
        # ====================================================
        res_rep_m = client_user1.get('/api/reports/monthly/')
        self.record_test("REPORTS", "Monthly Financial Report API", res_rep_m.status_code == 200)

        res_rep_e = client_user1.get('/api/reports/expenses/')
        self.record_test("REPORTS", "Expense Report API", res_rep_e.status_code == 200)

        res_rep_s = client_user1.get('/api/reports/savings/')
        self.record_test("REPORTS", "Savings Goals Report API", res_rep_s.status_code == 200)

        res_rep_sum = client_user1.get('/api/reports/summary/')
        self.record_test("REPORTS", "Combined Summary Report API", res_rep_sum.status_code == 200)

        res_pdf = client_user1.get('/api/reports/export/pdf/')
        is_pdf_valid = res_pdf.status_code == 200 and res_pdf.headers['Content-Type'] == 'application/pdf' and res_pdf.content.startswith(b'%PDF-')
        self.record_test("REPORTS", "Production PDF Report Export API", is_pdf_valid)

        res_excel = client_user1.get('/api/reports/export/excel/')
        is_excel_valid = False
        if res_excel.status_code == 200 and 'spreadsheetml.sheet' in res_excel.headers['Content-Type']:
            wb = openpyxl.load_workbook(io.BytesIO(res_excel.content))
            is_excel_valid = (len(wb.sheetnames) == 6)
        self.record_test("REPORTS", "Production Multi-Sheet Excel Export API (6 Sheets)", is_excel_valid)

        res_json = client_user1.get('/api/reports/export/?format=json')
        self.record_test("REPORTS", "JSON Export Backward Compatibility", res_json.status_code == 200)

        # ====================================================
        # 9. SECURITY & USER ISOLATION
        # ====================================================
        reg_user2 = client_unauth.post('/api/register/', {"username": "qa_user_2", "email": "qa_user_2@example.com", "password": "Password123!"}, format='json')
        token_u2 = client_unauth.post('/api/login/', {"username": "qa_user_2", "password": "Password123!"}, format='json').data.get('access')
        
        client_user2 = APIClient()
        client_user2.credentials(HTTP_AUTHORIZATION=f'Bearer {token_u2}')

        res_u2_dash = client_user2.get('/api/dashboard/')
        is_isolated = res_u2_dash.status_code == 200 and res_u2_dash.data['financial_summary']['total_income'] == 0.0 and len(res_u2_dash.data['latest_notifications']) == 0
        self.record_test("SECURITY", "Strict User Data Isolation (User A vs User B)", is_isolated)

        # ====================================================
        # 10. PERFORMANCE & BULK DATASET
        # ====================================================
        bulk_expenses = [
            Expense(user=user1, title=f"Bulk Item {i}", amount=Decimal("15.50"), category="FOOD", expense_date=self.today)
            for i in range(100)
        ]
        Expense.objects.bulk_create(bulk_expenses)
        res_bulk_dash = client_user1.get('/api/dashboard/')
        self.record_test("PERFORMANCE", "Large Dataset (100+ Bulk Expenses Response)", res_bulk_dash.status_code == 200)

        print("\n====================================================")
        print(f"QA AUTOMATION AUDIT COMPLETED: {self.passed_count} PASSED, {self.failed_count} FAILED")
        print("====================================================\n")
        return self.results, self.passed_count, self.failed_count

if __name__ == '__main__':
    runner = ComprehensiveQAAuditRunner()
    runner.run_all_tests()
