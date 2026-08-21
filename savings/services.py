import datetime
from django.db import transaction
from savings.models import SavingsGoal
from expenses.models import Expense

def process_recurring_savings_for_user(user):
    """
    Process automated recurring savings for a user.
    Calculates due dates from the last saved date (or start date) up to today,
    creates a SAVINGS category Expense for each, and updates the goal saved_amount and dates.
    """
    if not user.is_authenticated:
        return

    today = datetime.date.today()

    # Check for approaching deadlines (goals not completed with target_date in the next 7 days)
    from notifications.models import Notification
    all_active_goals = SavingsGoal.objects.filter(
        user=user,
        status__in=['Pending', 'In Progress']
    )
    for goal in all_active_goals:
        if goal.target_date and today <= goal.target_date <= today + datetime.timedelta(days=7):
            # Check if warning already sent within the last 7 days for this goal
            recent_warning_exists = Notification.objects.filter(
                user=user,
                notification_type="Savings",
                title="Savings Goal Deadline Approaching",
                created_at__date__gte=today - datetime.timedelta(days=7)
            ).filter(message__icontains=goal.goal_name).exists()

            if not recent_warning_exists:
                Notification.objects.create(
                    user=user,
                    title="Savings Goal Deadline Approaching",
                    message=f"Savings goal deadline approaching! Your goal '{goal.goal_name}' is set for {goal.target_date}. You have saved ₹{goal.saved_amount:.2f} of ₹{goal.target_amount:.2f}.",
                    notification_type="Savings",
                    priority="High"
                )

    active_goals = SavingsGoal.objects.filter(
        user=user,
        is_automated=True,
        status__in=['Pending', 'In Progress']
    )

    for goal in active_goals:
        # Determine the start point for scheduling
        start_date = goal.last_auto_save_date
        if not start_date:
            # Fallback to auto_save_start_date or created date
            start_date = goal.auto_save_start_date
            if not start_date:
                start_date = goal.created_at.date()

        current_check = start_date
        while True:
            # Calculate next due date
            if goal.frequency == 'Daily':
                next_due = current_check + datetime.timedelta(days=1)
            elif goal.frequency == 'Weekly':
                next_due = current_check + datetime.timedelta(weeks=1)
            elif goal.frequency == 'Monthly':
                # Add 1 month safely
                try:
                    if current_check.month == 12:
                        next_due = current_check.replace(year=current_check.year + 1, month=1)
                    else:
                        next_month = current_check.month + 1
                        # clamp days if day is invalid in target month (e.g. Jan 31 -> Feb 28)
                        day = current_check.day
                        while day > 28:
                            try:
                                next_due = current_check.replace(month=next_month, day=day)
                                break
                            except ValueError:
                                day -= 1
                        else:
                            next_due = current_check.replace(month=next_month, day=day)
                except Exception:
                    break
            elif goal.frequency == 'Custom':
                interval = goal.custom_interval_days or 30
                next_due = current_check + datetime.timedelta(days=interval)
            else:
                break

            # If next_due is in the future, stop processing for this goal
            if next_due > today:
                break

            # Check if goal is already completed before processing this due date
            goal.refresh_from_db()
            if goal.status == 'Completed':
                break

            # Process the due transfer atomically
            with transaction.atomic():
                Expense.objects.create(
                    user=user,
                    category='SAVINGS',
                    amount=goal.auto_save_amount,
                    date=next_due,
                    description=f"Auto-save for {goal.goal_name}"
                )
                goal.refresh_from_db()
                goal.last_auto_save_date = next_due
                goal.save()

            current_check = next_due
