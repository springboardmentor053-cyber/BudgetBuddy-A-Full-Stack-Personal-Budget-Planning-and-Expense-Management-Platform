import logging
from decimal import Decimal
from django.core.mail import EmailMessage
from django.conf import settings

logger = logging.getLogger(__name__)


def send_budget_alert_email(user, category, budget_amount, spent_amount, threshold_type):
    """
    Sends a budget alert email to the authenticated user's registered email address using SMTP settings.
    
    Parameters:
      user: User model instance
      category: string category name (e.g., 'FOOD')
      budget_amount: Decimal or float budget limit
      spent_amount: Decimal or float current spent amount
      threshold_type: string ('80', '90', or '100')
      
    Returns:
      bool: True if email sent successfully, False otherwise.
      
    Gracefully handles missing user email or SMTP failures without raising exceptions.
    """
    if not user or not getattr(user, 'email', None):
        logger.warning(f"Skipping budget alert email for user '{getattr(user, 'username', 'Unknown')}': User has no registered email address.")
        return False

    b_amt = Decimal(str(budget_amount))
    s_amt = Decimal(str(spent_amount))
    rem_amt = b_amt - s_amt
    utilization_pct = (s_amt / b_amt * Decimal('100')) if b_amt > Decimal('0') else Decimal('0')

    username = user.username or "User"

    if threshold_type == '80':
        subject = "Budget Alert - 80% Used"
        body = (
            f"Hello {username},\n\n"
            f"Your {category} budget has reached 80% of its allocated limit.\n\n"
            f"Budget: Rs. {b_amt:.2f}\n"
            f"Spent: Rs. {s_amt:.2f}\n"
            f"Utilization: {utilization_pct:.1f}%\n"
            f"Remaining: Rs. {rem_amt:.2f}\n\n"
            f"Please keep an eye on your spending.\n\n"
            f"Regards,\n"
            f"BudgetBuddy"
        )
    elif threshold_type == '90':
        subject = "Budget Alert - 90% Used"
        body = (
            f"Hello {username},\n\n"
            f"Your {category} budget has reached 90% of its allocated limit.\n\n"
            f"Budget: Rs. {b_amt:.2f}\n"
            f"Spent: Rs. {s_amt:.2f}\n"
            f"Utilization: {utilization_pct:.1f}%\n"
            f"Remaining: Rs. {rem_amt:.2f}\n\n"
            f"Warning: Your budget is close to being exceeded. Please keep an eye on your spending.\n\n"
            f"Regards,\n"
            f"BudgetBuddy"
        )
    else:  # 100% or above (exceeded)
        exceeded_by = max(Decimal('0.00'), s_amt - b_amt)
        subject = f"Budget Exceeded - {category}"
        body = (
            f"Hello {username},\n\n"
            f"Your {category} budget has exceeded the allocated limit.\n\n"
            f"Budget: Rs. {b_amt:.2f}\n"
            f"Spent: Rs. {s_amt:.2f}\n"
            f"Exceeded By: Rs. {exceeded_by:.2f}\n"
            f"Utilization: {utilization_pct:.1f}%\n\n"
            f"High Priority Warning: You have exceeded your budget limit for this category.\n\n"
            f"Regards,\n"
            f"BudgetBuddy"
        )


    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'noreply@budgetbuddy.com'

    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_email,
            to=[user.email]
        )
        msg.encoding = 'utf-8'
        msg.send(fail_silently=False)
        logger.info(f"Successfully sent {threshold_type}% budget alert email to {user.email} for category {category}.")
        return True
    except Exception as e:
        logger.error(f"Failed to send budget alert email to {user.email}: {str(e)}", exc_info=True)
        return False
