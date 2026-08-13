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


class Milestone4ComprehensiveTestSuite:
    def __init__(self):
        self.results = []
        self.passed_count = 0
        self.failed_count = 0
        self.today = date.today()

    def record_test(self, category, test_name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        if passed:
            self.passed_count += 1
        else:
            self.failed_count += 1
        
        entry = {
            "category": category,
            "test_name": test_name,
            "status": status,
            "details": details
        }
        self.results.append(entry)
        print(f"[{status}] [{category}] {test_name}: {details}")

    def run_all(self):
        print("====================================================")
        print("STARTING MILESTONE 4 COMPREHENSIVE AUTOMATED TESTS")
        print("====================================================\n")

        # Cleanup test users
        User.objects.filter(username__startswith='m4_user_').delete()

        client_unauth = APIClient()

        # ----------------------------------------------------
        # 1. AUTHENTICATION & JWT
        # ----------------------------------------------------
        reg_data = {"username": "m4_user_1", "email": "m4_user_1@example.com", "password": "Password123!"}
        res_reg = client_unauth.post('/api/register/', reg_data, format='json')
        self.record_test("AUTHENTICATION", "Register Valid User", res_reg.status_code in [200, 201], f"Status: {res_reg.status_code}")

        res_dup = client_unauth.post('/api/register/', reg_data, format='json')
        self.record_test("AUTHENTICATION", "Register Duplicate Username Prevention", res_dup.status_code == 400)

        res_login = client_unauth.post('/api/login/', {"username": "m4_user_1", "password": "Password123!"}, format='json')
        token = res_login.data.get('access') if res_login.status_code == 200 else None
        self.record_test("AUTHENTICATION", "Login & JWT Access Token Issuance", res_login.status_code == 200 and token is not None)

        res_invalid_login = client_unauth.post('/api/login/', {"username": "m4_user_1", "password": "WrongPassword!"}, format='json')
        self.record_test("AUTHENTICATION", "Invalid Password Denial", res_invalid_login.status_code in [400, 401])

        res_unauth = client_unauth.get('/api/dashboard/')
        self.record_test("AUTHENTICATION", "Unauthorized Endpoint Access Rejection", res_unauth.status_code in [401, 403])

        client_user1 = APIClient()
        client_user1.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        user1 = User.objects.get(username='m4_user_1')

        # ----------------------------------------------------
        # 2. EXPENSES CRUD & VALIDATION
        # ----------------------------------------------------
        res_exp_create = client_user1.post('/api/expenses/', {
          "title": "Groceries", "amount": "150.00", "category": "FOOD", "expense_date": self.today.isoformat()
        }, format='json')
        exp_id = res_exp_create.data.get('id') if res_exp_create.status_code == 201 else None
        self.record_test("EXPENSES", "Create Expense ($150.00)", res_exp_create.status_code == 201)

        res_exp_neg = client_user1.post('/api/expenses/', {
          "title": "Negative", "amount": "-50.00", "category": "FOOD", "expense_date": self.today.isoformat()
        }, format='json')
        self.record_test("EXPENSES", "Negative Amount Rejection (400)", res_exp_neg.status_code == 400)

        if exp_id:
            res_exp_upd = client_user1.put(f'/api/expenses/{exp_id}/', {
              "title": "Supermarket Groceries", "amount": "175.00", "category": "FOOD", "expense_date": self.today.isoformat()
            }, format='json')
            self.record_test("EXPENSES", "Update Expense ($175.00)", res_exp_upd.status_code == 200)

        # ----------------------------------------------------
        # 3. INCOME CRUD & VALIDATION
        # ----------------------------------------------------
        res_inc_create = client_user1.post('/api/income/', {
          "source": "Salary", "amount": "4000.00", "income_date": self.today.isoformat()
        }, format='json')
        inc_id = res_inc_create.data.get('id') if res_inc_create.status_code == 201 else None
        self.record_test("INCOME", "Create Income ($4,000.00)", res_inc_create.status_code == 201)

        res_inc_neg = client_user1.post('/api/income/', {
          "source": "Invalid", "amount": "-100.00", "income_date": self.today.isoformat()
        }, format='json')
        self.record_test("INCOME", "Negative Income Rejection (400)", res_inc_neg.status_code == 400)

        # ----------------------------------------------------
        # 4. BUDGETS & ALERTS DEDUPLICATION
        # ----------------------------------------------------
        Budget.objects.filter(user=user1).delete()
        Expense.objects.filter(user=user1).delete()
        Notification.objects.filter(user=user1).delete()

        res_bgt = client_user1.post('/api/budgets/', {
          "category": "FOOD", "budget_amount": "1000.00", "month": self.today.month, "year": self.today.year
        }, format='json')
        self.record_test("BUDGETS", "Create Budget ($1,000.00 for FOOD)", res_bgt.status_code == 201)

        res_bgt_invalid_month = client_user1.post('/api/budgets/', {
          "category": "TRAVEL", "budget_amount": "500.00", "month": 13, "year": self.today.year
        }, format='json')
        self.record_test("BUDGETS", "Invalid Month Rejection (Month=13 -> 400)", res_bgt_invalid_month.status_code == 400)

        # Spend 80% ($800)
        client_user1.post('/api/expenses/', {"title": "Food 1", "amount": "800.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        client_user1.post('/api/expenses/', {"title": "Food 1 Extra", "amount": "10.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_80 = Notification.objects.filter(user=user1, notification_type='BUDGET_80_PERCENT').count()
        self.record_test("BUDGETS", "Budget 80% Trigger & Deduplication", notif_80 == 1)

        # Spend 90% ($900)
        client_user1.post('/api/expenses/', {"title": "Food 2", "amount": "90.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_90 = Notification.objects.filter(user=user1, notification_type='BUDGET_90_PERCENT').count()
        self.record_test("BUDGETS", "Budget 90% Trigger & Deduplication", notif_90 == 1)

        # Spend 100%+ ($1050)
        client_user1.post('/api/expenses/', {"title": "Food 3", "amount": "150.00", "category": "FOOD", "expense_date": self.today.isoformat()}, format='json')
        notif_100 = Notification.objects.filter(user=user1, notification_type='BUDGET_EXCEEDED').count()
        self.record_test("BUDGETS", "Budget 100%+ Trigger & Deduplication", notif_100 == 1)

        # ----------------------------------------------------
        # 5. SAVINGS GOALS & MILESTONES
        # ----------------------------------------------------
        res_sav = client_user1.post('/api/savings/', {
          "goal_name": "New Laptop", "target_amount": "1500.00", "saved_amount": "0.00", "target_date": (self.today + timedelta(days=60)).isoformat()
        }, format='json')
        sav_id = res_sav.data.get('id') if res_sav.status_code == 201 else None
        self.record_test("SAVINGS", "Create Savings Goal ($1,500.00)", res_sav.status_code == 201)

        if sav_id:
            client_user1.put(f'/api/savings/{sav_id}/', {
              "goal_name": "New Laptop", "target_amount": "1500.00", "saved_amount": "1200.00", "target_date": (self.today + timedelta(days=60)).isoformat()
            }, format='json')
            has_80 = Notification.objects.filter(user=user1, notification_type='GOAL_80_PERCENT').exists()
            self.record_test("SAVINGS", "Savings Goal 80% Milestone Notification", has_80)

            client_user1.put(f'/api/savings/{sav_id}/', {
              "goal_name": "New Laptop", "target_amount": "1500.00", "saved_amount": "1500.00", "target_date": (self.today + timedelta(days=60)).isoformat()
            }, format='json')
            has_done = Notification.objects.filter(user=user1, notification_type='GOAL_ACHIEVED').exists()
            self.record_test("SAVINGS", "Savings Goal Completion Notification", has_done)

        # ----------------------------------------------------
        # 6. NOTIFICATIONS
        # ----------------------------------------------------
        res_notif_list = client_user1.get('/api/notifications/')
        self.record_test("NOTIFICATIONS", "Notification List API Fetch", res_notif_list.status_code == 200)

        res_mark_all = client_user1.patch('/api/notifications/mark-all-read/')
        self.record_test("NOTIFICATIONS", "Mark All Notifications as Read", res_mark_all.status_code == 200)

        # ----------------------------------------------------
        # 7. DASHBOARD API
        # ----------------------------------------------------
        res_dash = client_user1.get('/api/dashboard/')
        dash_has_keys = res_dash.status_code == 200 and all(
            k in res_dash.data for k in [
                'financial_summary', 'category_breakdown', 'monthly_expenses',
                'recent_transactions', 'latest_notifications', 'active_savings_goals'
            ]
        )
        self.record_test("DASHBOARD", "Dashboard Overview API (All 6 Primary Sections)", dash_has_keys)

        # ----------------------------------------------------
        # 8. ANALYTICS API
        # ----------------------------------------------------
        res_analytics = client_user1.get('/api/analytics/')
        analytics_valid = res_analytics.status_code == 200 and all(
            k in res_analytics.data for k in [
                'total_income', 'total_expense', 'total_savings', 'current_balance',
                'category_breakdown', 'monthly_expenses', 'income_vs_expense',
                'budget_utilization', 'savings_goal_progress'
            ]
        )
        self.record_test("ANALYTICS", "Analytics API Complete Visual Data Structure", analytics_valid)

        # ----------------------------------------------------
        # 9. REPORTS & DATE VALIDATION
        # ----------------------------------------------------
        res_rep_m = client_user1.get('/api/reports/monthly/')
        self.record_test("REPORTS", "Monthly Report API", res_rep_m.status_code == 200)

        res_rep_prev = client_user1.get('/api/reports/monthly/?period=previous_month')
        self.record_test("REPORTS", "Previous Month Filter API", res_rep_prev.status_code == 200)

        # Invalid Date Range (start_date > end_date)
        res_inv_range = client_user1.get(f'/api/reports/monthly/?start_date=2026-12-31&end_date=2026-01-01')
        self.record_test("REPORTS", "Invalid Date Range Rejection (Start > End -> 400)", res_inv_range.status_code == 400)

        # ----------------------------------------------------
        # 10. EXPORT VERIFICATION (PDF, EXCEL, JSON)
        # ----------------------------------------------------
        res_pdf = client_user1.get('/api/reports/export/pdf/')
        pdf_valid = res_pdf.status_code == 200 and res_pdf.content.startswith(b'%PDF-')
        self.record_test("EXPORTS", "PDF Export Download & Content Header Verification", pdf_valid)

        res_excel = client_user1.get('/api/reports/export/excel/')
        excel_valid = False
        if res_excel.status_code == 200:
            wb = openpyxl.load_workbook(io.BytesIO(res_excel.content))
            excel_valid = (len(wb.sheetnames) == 6)
        self.record_test("EXPORTS", "Multi-Sheet Excel Export (6 Workbook Sheets)", excel_valid)

        res_json = client_user1.get('/api/reports/export/?format=json')
        json_valid = res_json.status_code == 200 and 'financial_summary' in res_json.data
        self.record_test("EXPORTS", "JSON Export Download Verification", json_valid)

        # ----------------------------------------------------
        # 11. USER ISOLATION
        # ----------------------------------------------------
        client_unauth.post('/api/register/', {"username": "m4_user_2", "email": "m4_user_2@example.com", "password": "Password123!"}, format='json')
        res_login_u2 = client_unauth.post('/api/login/', {"username": "m4_user_2", "password": "Password123!"}, format='json')
        token_u2 = res_login_u2.data.get('access')

        client_user2 = APIClient()
        client_user2.credentials(HTTP_AUTHORIZATION=f'Bearer {token_u2}')

        res_u2_dash = client_user2.get('/api/dashboard/')
        is_isolated = res_u2_dash.status_code == 200 and res_u2_dash.data['financial_summary']['total_income'] == 0.0 and len(res_u2_dash.data['recent_transactions']) == 0
        self.record_test("USER ISOLATION", "Strict Data Privacy Between User 1 & User 2", is_isolated)

        # ----------------------------------------------------
        # 12. EDGE CASES (ZERO DATA & LARGE NUMBERS)
        # ----------------------------------------------------
        res_u2_analytics = client_user2.get('/api/analytics/')
        zero_data_valid = res_u2_analytics.status_code == 200 and res_u2_analytics.data['current_balance'] == 0.0
        self.record_test("EDGE CASES", "New User Zero Data Analytics Stability", zero_data_valid)

        res_u2_pdf = client_user2.get('/api/reports/export/pdf/')
        empty_pdf_valid = res_u2_pdf.status_code == 200 and res_u2_pdf.content.startswith(b'%PDF-')
        self.record_test("EDGE CASES", "Empty User PDF Export Generation Without Crash", empty_pdf_valid)

        print("\n====================================================")
        print(f"MILESTONE 4 TEST SUITE FINISHED: {self.passed_count} PASSED, {self.failed_count} FAILED")
        print("====================================================\n")
        return self.passed_count, self.failed_count


if __name__ == '__main__':
    runner = Milestone4ComprehensiveTestSuite()
    passed, failed = runner.run_all()
    if failed > 0:
        sys.exit(1)
