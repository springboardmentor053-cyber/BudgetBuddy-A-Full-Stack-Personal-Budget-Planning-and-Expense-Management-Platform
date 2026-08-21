from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from savings.models import SavingsGoal
from budgets.models import Budget
from expenses.models import Expense
from income.models import Income
from .models import Notification

@receiver(pre_save, sender=SavingsGoal)
def store_original_savings_goal_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            original = SavingsGoal.objects.get(pk=instance.pk)
            instance._original_status = original.status
            instance._original_saved_amount = original.saved_amount
        except SavingsGoal.DoesNotExist:
            instance._original_status = None
            instance._original_saved_amount = None
    else:
        instance._original_status = None
        instance._original_saved_amount = None

@receiver(post_save, sender=SavingsGoal)
def savings_goal_notifications(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="Savings Goal Created",
            message=f"Savings goal '{instance.goal_name}' has been created with a target of ₹{instance.target_amount:.2f}.",
            notification_type="Savings",
            priority="Medium"
        )
    else:
        # Check transition to Completed or milestone achievements
        original_status = getattr(instance, '_original_status', None)
        original_saved_amount = getattr(instance, '_original_saved_amount', 0) or 0
        
        target = instance.target_amount
        
        # Check status transition to Completed
        if instance.status == 'Completed' and original_status != 'Completed':
            Notification.objects.create(
                user=instance.user,
                title="Savings Goal Completed",
                message=f"Congratulations! You have completed your savings goal '{instance.goal_name}' by saving ₹{instance.saved_amount:.2f}.",
                notification_type="Savings",
                priority="High"
            )
        elif float(target) > 0:
            old_pct = (float(original_saved_amount) / float(target)) * 100
            new_pct = (float(instance.saved_amount) / float(target)) * 100
            
            # Reached 50% milestone
            if old_pct < 50 <= new_pct < 100:
                Notification.objects.create(
                    user=instance.user,
                    title="Savings Goal Milestone Reached",
                    message=f"Great job! You have reached 50% of your savings goal '{instance.goal_name}' by saving ₹{instance.saved_amount:.2f} of ₹{target:.2f}.",
                    notification_type="Savings",
                    priority="Medium"
                )
            # Reached 90% milestone
            elif old_pct < 90 <= new_pct < 100:
                Notification.objects.create(
                    user=instance.user,
                    title="Savings Goal Milestone Reached",
                    message=f"Almost there! You have reached 90% of your savings goal '{instance.goal_name}' by saving ₹{instance.saved_amount:.2f} of ₹{target:.2f}.",
                    notification_type="Savings",
                    priority="High"
                )

@receiver(post_save, sender=Budget)
def budget_notifications(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="Budget Created",
            message=f"A budget of ₹{instance.limit_amount:.2f} has been set for '{instance.category}' for the month of {instance.month}.",
            notification_type="Budget",
            priority="Low"
        )
    else:
        Notification.objects.create(
            user=instance.user,
            title="Budget Updated",
            message=f"The budget limit for '{instance.category}' in {instance.month} has been updated to ₹{instance.limit_amount:.2f}.",
            notification_type="Budget",
            priority="Medium"
        )
    
    # Check if existing expenses exceed this budget (either created or updated)
    from django.db.models import Sum
    import datetime

    # Get month number from month string
    try:
        month_num = datetime.datetime.strptime(instance.month, "%B").month
    except ValueError:
        return
        
    current_year = datetime.date.today().year
    start_of_month = datetime.date(current_year, month_num, 1)
    if month_num == 12:
        end_of_month = datetime.date(current_year + 1, 1, 1)
    else:
        end_of_month = datetime.date(current_year, month_num + 1, 1)

    total_spent = Expense.objects.filter(
        user=instance.user,
        category__iexact=instance.category,
        date__gte=start_of_month,
        date__lt=end_of_month
    ).aggregate(total=Sum('amount'))['total'] or 0

    if total_spent > instance.limit_amount:
        # Check if an unread exceedance notification already exists
        exists = Notification.objects.filter(
            user=instance.user,
            notification_type="Budget",
            title="Budget Limit Exceeded",
            is_read=False
        ).filter(message__icontains=instance.category).filter(message__icontains=instance.month).exists()

        if not exists:
            Notification.objects.create(
                user=instance.user,
                title="Budget Limit Exceeded",
                message=f"Budget limit exceeded! You have spent ₹{total_spent:.2f} of your ₹{instance.limit_amount:.2f} limit on {instance.category} in {instance.month}.",
                notification_type="Budget",
                priority="High"
            )

@receiver(post_save, sender=Expense)
def expense_budget_check(sender, instance, created, **kwargs):
    from django.db.models import Sum
    from decimal import Decimal
    import datetime

    current_date = instance.date
    month_str = current_date.strftime("%B")

    budget = Budget.objects.filter(
        user=instance.user,
        category__iexact=instance.category,
        month=month_str
    ).first()

    if budget:
        start_of_month = datetime.date(current_date.year, current_date.month, 1)
        if current_date.month == 12:
            end_of_month = datetime.date(current_date.year + 1, 1, 1)
        else:
            end_of_month = datetime.date(current_date.year, current_date.month + 1, 1)

        total_spent = sender.objects.filter(
            user=instance.user,
            category__iexact=instance.category,
            date__gte=start_of_month,
            date__lt=end_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0

        if total_spent > budget.limit_amount:
            # Check if an unread exceedance notification already exists
            exists = Notification.objects.filter(
                user=instance.user,
                notification_type="Budget",
                title="Budget Limit Exceeded",
                is_read=False
            ).filter(message__icontains=instance.category).filter(message__icontains=month_str).exists()

            if not exists:
                Notification.objects.create(
                    user=instance.user,
                    title="Budget Limit Exceeded",
                    message=f"Budget limit exceeded! You have spent ₹{total_spent:.2f} of your ₹{budget.limit_amount:.2f} limit on {instance.category} in {month_str}.",
                    notification_type="Budget",
                    priority="High"
                )
        elif total_spent >= budget.limit_amount * Decimal('0.80'):
            # Check if an unread warning notification already exists
            exists = Notification.objects.filter(
                user=instance.user,
                notification_type="Budget",
                title="Budget Limit Warning",
                is_read=False
            ).filter(message__icontains=instance.category).filter(message__icontains=month_str).exists()

            if not exists:
                Notification.objects.create(
                    user=instance.user,
                    title="Budget Limit Warning",
                    message=f"Budget limit warning! You have spent ₹{total_spent:.2f} of your ₹{budget.limit_amount:.2f} limit on {instance.category} in {month_str} (80% reached).",
                    notification_type="Budget",
                    priority="Medium"
                )


@receiver(post_save, sender=Expense)
def large_expense_alert(sender, instance, created, **kwargs):
    if created and instance.amount >= 5000:
        Notification.objects.create(
            user=instance.user,
            title="Large Expense Alert",
            message=f"A large expense has been logged! You spent ₹{instance.amount:.2f} on '{instance.category}' (Details: {instance.description or 'No description'}).",
            notification_type="General",
            priority="High"
        )


@receiver(post_save, sender=Income)
def income_deposit_alert(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="Income Logged",
            message=f"A new income of ₹{instance.amount:.2f} from '{instance.source}' has been added (Details: {instance.title}).",
            notification_type="General",
            priority="Medium"
        )

@receiver(post_save, sender=Expense)
def savings_transfer_to_goal(sender, instance, created, **kwargs):
    if instance.category.upper() == 'SAVINGS' and created:
        goals = SavingsGoal.objects.filter(user=instance.user, status__in=['Pending', 'In Progress']).order_by('target_date')
        if not goals.exists():
            return
        
        target_goal = None
        desc = (instance.description or '').strip().lower()
        if desc:
            for g in goals:
                if g.goal_name.lower() in desc or desc in g.goal_name.lower():
                    target_goal = g
                    break
        
        if not target_goal:
            target_goal = goals.first()
            
        if target_goal:
            from decimal import Decimal
            expense_amt = Decimal(str(instance.amount))
            new_amount = target_goal.saved_amount + expense_amt
            if new_amount > target_goal.target_amount:
                target_goal.saved_amount = target_goal.target_amount
            else:
                target_goal.saved_amount = new_amount
            target_goal.save()


@receiver(post_save, sender=Notification)
def send_email_notification(sender, instance, created, **kwargs):
    if created:
        from django.core.mail import send_mail
        from django.conf import settings
        from users.models import Profile

        user = instance.user
        if not user.email:
            return

        profile, _ = Profile.objects.get_or_create(user=user)
        if getattr(profile, 'email_notifications_enabled', True):
            subject = f"[BudgetBuddy] {instance.title}"
            message = instance.message
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@budgetbuddy.com')
            try:
                send_mail(
                    subject,
                    message,
                    from_email,
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                pass


@receiver(post_save, sender=User)
def welcome_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance,
            title="Welcome to BudgetBuddy!",
            message=f"Hi {instance.username}, thank you for registering with BudgetBuddy! We are excited to help you manage your personal budget and track expenses.",
            notification_type="General",
            priority="Medium"
        )

