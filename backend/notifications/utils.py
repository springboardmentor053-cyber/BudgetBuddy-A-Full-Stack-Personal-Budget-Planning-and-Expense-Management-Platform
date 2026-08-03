from django.core.mail import send_mail
from django.conf import settings

def send_budget_alert_email(user_email, username, category_name, current_spent, budget_limit):
    subject = f'⚠️ Budget Buddy Alert: Exceeded {category_name} Limit!'
    
    message = (
        f"Hi {username},\n\n"
        f"You have spent ${current_spent:.2f} on '{category_name}', which exceeds your set budget limit of ${budget_limit:.2f}.\n\n"
        f"Log into BudgetBuddy to adjust your limits or review your recent expenses.\n\n"
        f"Best,\n"
        f"The BudgetBuddy Team 💰"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        print(f"Email successfully sent to {user_email}!")
    except Exception as e:
        print(f"Failed to send email: {e}")