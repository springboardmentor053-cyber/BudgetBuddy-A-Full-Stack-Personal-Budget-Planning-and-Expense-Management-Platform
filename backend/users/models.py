from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', _('Student')
        PREMIUM_USER = 'premium_user', _('Premium User')
        ADMIN = 'admin', _('Admin')

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(on_delete=models.CASCADE, related_name='profile', to='users.user')
    monthly_income_setup = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='USD')
    financial_preferences = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    def __str__(self) -> str:
        return f'{self.user.username} profile'


class Income(models.Model):
    user = models.ForeignKey('users.user', on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self) -> str:
        return f'{self.user.username} - {self.amount}'


class Expense(models.Model):
    class Category(models.TextChoices):
        FOOD = 'FOOD', _('Food')
        TRAVEL = 'TRAVEL', _('Travel')
        SHOPPING = 'SHOPPING', _('Shopping')
        EDUCATION = 'EDUCATION', _('Education')
        ENTERTAINMENT = 'ENTERTAINMENT', _('Entertainment')
        HEALTHCARE = 'HEALTHCARE', _('Healthcare')
        BILLS = 'BILLS', _('Bills')
        MISCELLANEOUS = 'MISCELLANEOUS', _('Miscellaneous')

    user = models.ForeignKey('users.user', on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField(blank=True, null=True)
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date']

    def __str__(self) -> str:
        return f'{self.user.username} - {self.title} ({self.amount})'


class Budget(models.Model):
    user = models.ForeignKey('users.user', on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=20)
    monthly_budget_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_utilization = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        ordering = ['-start_date']

    def __str__(self) -> str:
        return f'{self.user.username} - {self.category}'


class SavingsGoal(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')

    user = models.ForeignKey('users.user', on_delete=models.CASCADE, related_name='savings_goals')
    goal_name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ['-target_date']

    def __str__(self) -> str:
        return self.goal_name


class Notification(models.Model):
    class Type(models.TextChoices):
        BUDGET_ALERT = 'Budget Alert', _('Budget Alert')
        SAVINGS_REMINDER = 'Savings Reminder', _('Savings Reminder')

    user = models.ForeignKey('users.user', on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=20, choices=Type.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.user.username} - {self.type}'
