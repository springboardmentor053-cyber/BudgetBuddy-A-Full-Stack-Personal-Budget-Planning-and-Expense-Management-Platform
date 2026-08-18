import json
from datetime import date
from decimal import Decimal
from unittest.mock import patch
from urllib.error import URLError

from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase, override_settings

from budgets.models import Budget, SavingsGoal
from expenses.models import Expense
from rest_framework.test import APIClient

from .models import Notification
from .email_utils import send_notification_email
from .utils import (
    check_budget_alert,
    check_savings_goal_alert,
    create_notification_and_email,
)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="notifications@budgetbuddy.test",
)
class NotificationEmailTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="notification-user",
            email="user@example.com",
            password="safe-password",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_creates_matching_in_app_and_email_notification(self):
        notification = create_notification_and_email(
            user=self.user,
            notification_type="BUDGET_CREATED",
            title="Budget Created - Food",
            message="Your Food budget was created.",
            priority="MEDIUM",
        )

        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(notification.title, "Budget Created - Food")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Budget Created - Food")
        self.assertEqual(mail.outbox[0].to, ["user@example.com"])
        self.assertIn("Your Food budget was created.", mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].alternatives[0][1], "text/html")

    def test_duplicate_alert_sends_only_one_email(self):
        event = {
            "user": self.user,
            "notification_type": "BUDGET_WARNING",
            "title": "Food Budget - July 2026",
            "message": "Budget warning.",
            "priority": "MEDIUM",
            "deduplicate": True,
        }

        create_notification_and_email(**event)
        create_notification_and_email(**event)

        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_email_failure_does_not_prevent_notification_creation(self):
        with patch(
            "notifications.utils.send_notification_email",
            side_effect=RuntimeError("SMTP unavailable"),
        ):
            notification = create_notification_and_email(
                user=self.user,
                notification_type="BUDGET_UPDATED",
                title="Budget Updated - Food",
                message="Your Food budget was updated.",
                priority="MEDIUM",
            )

        self.assertTrue(Notification.objects.filter(pk=notification.pk).exists())

    def test_missing_email_still_creates_in_app_notification(self):
        self.user.email = ""
        self.user.save(update_fields=["email"])

        create_notification_and_email(
            user=self.user,
            notification_type="SAVINGS_GOAL_CREATED",
            title="Savings Goal Created - Laptop",
            message="Your goal was created.",
            priority="MEDIUM",
        )

        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 0)

    def test_smtp_failure_is_logged_and_returns_false(self):
        with patch(
            "notifications.email_utils.EmailMultiAlternatives.send",
            side_effect=RuntimeError("SMTP unavailable"),
        ):
            with self.assertLogs("notifications.email_utils", level="ERROR") as logs:
                sent = send_notification_email(
                    self.user,
                    "Budget Created - Food",
                    "Your Food budget was created.",
                )

        self.assertFalse(sent)
        self.assertIn("RuntimeError: SMTP unavailable", logs.output[0])

    @override_settings(RESEND_API_KEY="test-resend-api-key")
    @patch("notifications.email_utils.urlopen")
    def test_resend_sends_existing_notification_content(self, mock_urlopen):
        response = mock_urlopen.return_value.__enter__.return_value
        response.status = 200

        create_notification_and_email(
            user=self.user,
            notification_type="BUDGET_CREATED",
            title="Budget Created - Food",
            message="Your Food budget was created.",
            priority="MEDIUM",
        )

        request = mock_urlopen.call_args.args[0]
        payload = json.loads(request.data.decode("utf-8"))
        self.assertEqual(request.full_url, "https://api.resend.com/emails")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-resend-api-key")
        self.assertEqual(
            payload["from"],
            "BudgetBuddy <onboarding@resend.dev>",
        )
        self.assertEqual(payload["to"], ["user@example.com"])
        self.assertEqual(payload["subject"], "Budget Created - Food")
        self.assertIn("Your Food budget was created.", payload["text"])
        self.assertIn("Your Food budget was created.", payload["html"])

    @override_settings(RESEND_API_KEY="test-resend-api-key")
    @patch(
        "notifications.email_utils.urlopen",
        side_effect=URLError("connection unavailable"),
    )
    def test_resend_failure_does_not_prevent_notification_creation(self, _):
        with self.assertLogs("notifications.email_utils", level="ERROR") as logs:
            notification = create_notification_and_email(
                user=self.user,
                notification_type="BUDGET_CREATED",
                title="Budget Created - Food",
                message="Your Food budget was created.",
                priority="MEDIUM",
            )

        self.assertTrue(Notification.objects.filter(pk=notification.pk).exists())
        self.assertIn("Resend email connection failed", logs.output[0])

    def test_budget_alert_creates_in_app_notification_and_email(self):
        Budget.objects.create(
            user=self.user,
            category="Food",
            amount=Decimal("100.00"),
            month="July 2026",
        )
        Expense.objects.create(
            user=self.user,
            title="Groceries",
            category="Food",
            amount=Decimal("85.00"),
            date=date(2026, 7, 10),
        )

        check_budget_alert(self.user, "Food", date(2026, 7, 10))

        notification = Notification.objects.get(
            notification_type="BUDGET_WARNING"
        )
        self.assertIn("Budget: ₹100", notification.message)
        self.assertIn("Spent: ₹85", notification.message)
        self.assertIn("Usage: 85.0%", notification.message)
        self.assertEqual(len(mail.outbox), 1)

    def test_savings_goal_creation_creates_in_app_notification_and_email(self):
        response = self.client.post(
            "/api/budgets/savings-goals/",
            {
                "title": "Laptop",
                "target_amount": "50000.00",
                "saved_amount": "0.00",
                "target_date": "2026-12-31",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        notification = Notification.objects.get(
            notification_type="SAVINGS_GOAL_CREATED"
        )
        self.assertIn("Target date: 2026-12-31", notification.message)
        self.assertEqual(len(mail.outbox), 1)

    def test_savings_goal_completion_creates_one_in_app_notification_and_email(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            title="Emergency Fund",
            target_amount=Decimal("1000.00"),
            saved_amount=Decimal("1000.00"),
        )

        check_savings_goal_alert(goal)
        check_savings_goal_alert(goal)

        self.assertEqual(
            Notification.objects.filter(notification_type="GOAL_COMPLETED").count(),
            1,
        )
        self.assertEqual(len(mail.outbox), 1)
