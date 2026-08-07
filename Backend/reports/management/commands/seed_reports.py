import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

# Adjust these imports if your model paths differ
from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with mock financial records for testing reports"

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # Get or create test user
        user, _ = User.objects.get_or_create(username="testuser")
        user.set_password("testpassword123")
        user.save()

        # Clean existing data for clean seed
        Expense.objects.filter(user=user).delete()
        Income.objects.filter(user=user).delete()
        SavingsGoal.objects.filter(user=user).delete()
        Budget.objects.filter(user=user).delete()

        today = timezone.now().date()

        # Seed Incomes
        Income.objects.create(user=user, source="Salary", amount=Decimal(
            "5000.00"), date=today.replace(day=1))
        Income.objects.create(user=user, source="Freelance", amount=Decimal(
            "1200.00"), date=today - timedelta(days=10))

        # Seed Expenses
        categories = ["Food", "Transport",
                      "Utilities", "Entertainment", "Shopping"]
        for i in range(15):
            days_ago = random.randint(1, 25)
            Expense.objects.create(
                user=user,
                title=f"Sample Expense {i+1}",
                amount=Decimal(str(round(random.uniform(10.0, 150.0), 2))),
                date=today - timedelta(days=days_ago),
                description="Seeded test expense"
            )

        # Seed Savings Goals
        SavingsGoal.objects.create(user=user, name="Emergency Fund", target_amount=Decimal(
            "10000.00"), saved_amount=Decimal("4500.00"))
        SavingsGoal.objects.create(user=user, name="New Laptop", target_amount=Decimal(
            "2000.00"), saved_amount=Decimal("2000.00"))

        # Seed Budget
        Budget.objects.create(user=user, amount=Decimal(
            "3000.00"), date=today.replace(day=1))

        self.stdout.write(self.style.SUCCESS(
            "Successfully seeded test data for 'testuser'!"))
