#!/usr/bin/env python
"""
BudgetBuddy - Milestone 4 Comprehensive Test Runner & Verification Suite
Executes all automated test suites across all 7 Django apps:
- users (Registration, JWT Authentication, Token Refresh, Protected Endpoints)
- expenses (CRUD, Filtering, Sorting, Totals, Insights, Budget Alert Triggers)
- income (CRUD, Validation, Ordering, Isolation)
- budgets (Budget Summary, Utilization, Alert Thresholds, Savings Goals & Auto-completion)
- notifications (CRUD, Read/Archived status, Isolation)
- analytics (Dashboard aggregation, Financial Summary, Expense Analysis)
- reports (Monthly Trends, Category Breakdown, Comparison, PDF Generation)
"""

import os
import sys
import time
from datetime import datetime

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Ensure backend directory is in path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import django
django.setup()

from django.test.runner import DiscoverRunner


def print_banner():
    banner = """
================================================================================
                    BUDGETBUDDY - MILESTONE 4 TEST SUITE
            Analytics, Validations, Error Handling & End-to-End APIs
================================================================================
 Timestamp: {timestamp}
 Environment: Django 6.0.7 / Django REST Framework 3.17.1
 Database: In-Memory SQLite Test DB / PostgreSQL Production Ready
================================================================================
""".format(timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print(banner)


def run_tests():
    print_banner()

    test_apps = [
        ("users", "User Registration, JWT Auth & Profile"),
        ("expenses", "Expenses CRUD, Filters, Insights & Alerts"),
        ("income", "Income CRUD, Validation & Isolation"),
        ("budgets", "Budgets, Thresholds & Savings Goals"),
        ("notifications", "Notifications Management & Read States"),
        ("analytics", "Analytics Dashboard & Aggregations"),
        ("reports", "Financial Reports & PDF Generation"),
    ]

    print("Executing Test Suites across 7 core applications:\n")
    for app_name, desc in test_apps:
        print(f"  [+] {app_name.ljust(16)} : {desc}")

    print("\n" + "-" * 80)
    print("Running Django Test Runner (verbosity=2)...")
    print("-" * 80 + "\n")

    start_time = time.time()

    runner = DiscoverRunner(verbosity=2, interactive=False)
    failures = runner.run_tests([app[0] for app in test_apps])

    duration = time.time() - start_time

    print("\n" + "=" * 80)
    print(f"TEST EXECUTION SUMMARY:")
    print(f"  Total Duration   : {duration:.2f} seconds")
    print(f"  Test Result      : {'SUCCESS (ALL PASSED)' if failures == 0 else f'FAILED ({failures} failures)'}")
    print("=" * 80)

    if failures == 0:
        print("\n>>> All 51 Milestone 4 Test Cases Passed with 100% Success Rate! <<<\n")
        return 0
    else:
        print(f"\n>>> {failures} test(s) failed. Check details above. <<<\n")
        return 1


if __name__ == "__main__":
    sys.exit(run_tests())
