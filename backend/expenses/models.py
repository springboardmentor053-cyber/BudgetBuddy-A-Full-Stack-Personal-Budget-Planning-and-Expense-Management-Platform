from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    """
    UserProfile model to extend the default Django User model with additional details.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True, help_text="A short biography of the user.")
    phone_number = models.CharField(max_length=15, blank=True, null=True, help_text="User's phone number.")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Timestamp when the profile was created.")
    updated_at = models.DateTimeField(auto_now=True, help_text="Timestamp when the profile was last updated.")

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Income(models.Model):
    """
    Income model to record the user's income entries.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=200, help_text="Source of the income.")
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="The amount of income received.")
    description = models.TextField(blank=True, null=True, help_text="A short description of the income.")
    income_date = models.DateField(help_text="The date when the income was received.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-income_date']

    def __str__(self):
        return f"{self.source} - {self.amount}"


class Expense(models.Model):
    """
    Expense model to record the user's spending entries.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=200, help_text="What the expense was for.")
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="The amount spent.")
    category = models.CharField(max_length=100, help_text="Category of the expense (e.g., Food, Rent).")
    description = models.TextField(blank=True, null=True, help_text="A description of the expense.")
    expense_date = models.DateField(help_text="The date when the expense occurred.")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Timestamp when the expense was created.")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date']

    def __str__(self):
        return self.title


class Budget(models.Model):
    """
    Budget model to define monthly/periodic spending limits per category for a user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=100, help_text="Category for this budget (e.g., Food, Travel).")
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Budget allocation amount.")
    month = models.PositiveIntegerField(help_text="Month of the budget (1-12).")
    year = models.PositiveIntegerField(help_text="Year of the budget (e.g., 2026).")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['year', 'month']
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.category} Budget for {self.user.username} ({self.budget_amount})"


class SavingsGoal(models.Model):
    """
    SavingsGoal model to represent specific savings targets for a user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=200, help_text="Name of the savings goal (e.g., New Laptop, Vacation).")
    target_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="The target savings amount.")
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="The current accumulated savings.")
    target_date = models.DateField(help_text="Desired completion date for this goal.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_date']

    def __str__(self):
        return f"{self.name} ({self.current_amount}/{self.target_amount})"


class Notification(models.Model):
    """
    Notification model to store alerts or system updates for a user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField(help_text="The body content of the notification.")
    is_read = models.BooleanField(default=False, help_text="Indicates whether the notification has been read.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}"


class Report(models.Model):
    """
    Report model to save pre-generated financial statement summaries/reports for users.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200, help_text="Title or description of the report.")
    generated_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(default=dict, help_text="Serialized statistical data representing the report.")

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"Report: {self.title} for {self.user.username}"