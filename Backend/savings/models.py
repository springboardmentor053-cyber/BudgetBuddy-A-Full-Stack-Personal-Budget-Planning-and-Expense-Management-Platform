from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone


class SavingsGoal(models.Model):

    # ============================================================
    # STATUS OPTIONS
    # ============================================================

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
    ]

    # ============================================================
    # USER
    # Each savings goal belongs to one authenticated user
    # ============================================================

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='savings_goals'
    )

    # ============================================================
    # GOAL DETAILS
    # ============================================================

    goal_name = models.CharField(
        max_length=200
    )

    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    saved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    target_date = models.DateField()

    # ============================================================
    # GOAL STATUS
    # ============================================================

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # ============================================================
    # VALIDATION
    # ============================================================

    def clean(self):

        # Target amount must be greater than zero
        if self.target_amount <= 0:
            raise ValidationError({
                'target_amount': 'Target amount must be greater than zero.'
            })

        # Saved amount cannot be negative
        if self.saved_amount < 0:
            raise ValidationError({
                'saved_amount': 'Saved amount cannot be negative.'
            })

        # Saved amount cannot be greater than target amount
        if self.saved_amount > self.target_amount:
            raise ValidationError({
                'saved_amount': (
                    'Saved amount cannot be greater than target amount.'
                )
            })

        # Target date cannot be in the past
        # This validation is applied when creating a new goal
        if not self.pk and self.target_date < timezone.now().date():
            raise ValidationError({
                'target_date': (
                    'Target date cannot be in the past.'
                )
            })

    # ============================================================
    # SAVE METHOD
    # Automatically updates the goal status
    # ============================================================

    def save(self, *args, **kwargs):

        # Run all validations before saving
        self.full_clean()

        # Automatically mark goal as completed
        # when saved amount reaches target amount
        if self.saved_amount >= self.target_amount:
            self.status = 'COMPLETED'
        else:
            self.status = 'ACTIVE'

        super().save(*args, **kwargs)

    # ============================================================
    # STRING REPRESENTATION
    # ============================================================

    def __str__(self):
        return f"{self.user.username} - {self.goal_name}"

    # ============================================================
    # REMAINING AMOUNT
    # Formula:
    # Remaining Amount = Target Amount - Saved Amount
    # ============================================================

    @property
    def remaining_amount(self):
        return self.target_amount - self.saved_amount

    # ============================================================
    # PROGRESS PERCENTAGE
    # Formula:
    # Progress % = (Saved Amount / Target Amount) * 100
    # ============================================================

    @property
    def progress_percentage(self):

        if self.target_amount == 0:
            return 0

        return round(
            (self.saved_amount / self.target_amount) * 100,
            2
        )