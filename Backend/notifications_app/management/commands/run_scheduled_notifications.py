# notifications_app/management/commands/run_scheduled_notifications.py
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications_app.utils import send_notification

User = get_user_model()

MOTIVATIONAL_QUOTES = [
    "A penny saved is a penny earned!",
    "Do not save what is left after spending, but spend what is left after saving.",
    "Small daily savings lead to big annual rewards!"
]


class Command(BaseCommand):
    help = "Triggers periodic notifications like reminders, reports, and tips."

    def handle(self, *args, **kwargs):
        users = User.objects.all()

        for user in users:
            # 1. SAVINGS_REMINDER
            send_notification(
                user=user,
                title="Weekly Savings Reminder 💡",
                message="Don't forget to contribute towards your savings goals this week!",
                notification_type="SAVINGS_REMINDER",
                priority="LOW",
            )

            # 2. MONTHLY_REPORT
            send_notification(
                user=user,
                title="Monthly Summary Ready 📊",
                message="Your monthly income and expense report is now available.",
                notification_type="MONTHLY_REPORT",
                priority="MEDIUM",
            )

            # 3. MOTIVATION
            send_notification(
                user=user,
                title="Daily Motivation ✨",
                message=random.choice(MOTIVATIONAL_QUOTES),
                notification_type="MOTIVATION",
                priority="LOW",
            )

        self.stdout.write(self.style.SUCCESS(
            "All scheduled notifications generated successfully!"))
