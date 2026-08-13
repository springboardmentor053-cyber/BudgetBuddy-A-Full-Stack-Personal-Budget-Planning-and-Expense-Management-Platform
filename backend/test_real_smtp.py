import os
import sys
import django

# Load .env if python-dotenv is available
try:
    import dotenv
    root_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    if os.path.exists(root_env):
        dotenv.load_dotenv(root_env)
    backend_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(backend_env):
        dotenv.load_dotenv(backend_env)
except ImportError:
    pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User

def run_real_smtp_test():
    print("====================================================")
    print("REAL DJANGO SMTP VERIFICATION TEST")
    print("====================================================\n")

    email_backend = getattr(settings, 'EMAIL_BACKEND', 'NOT SET')
    email_host = getattr(settings, 'EMAIL_HOST', '')
    email_port = getattr(settings, 'EMAIL_PORT', 587)
    email_user = getattr(settings, 'EMAIL_HOST_USER', '')
    email_pass = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    default_from = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@budgetbuddy.com')

    # Retrieve last registered user email or fallback to EMAIL_HOST_USER
    last_user = User.objects.filter(email__contains='@').order_by('-id').first()
    recipient = last_user.email if last_user and last_user.email else (email_user or 'recipient@example.com')

    print(f"SMTP BACKEND: {email_backend}")
    print(f"SMTP HOST: '{email_host}'")
    print(f"SMTP PORT: {email_port}")
    print(f"SMTP USER: '{email_user}'")
    print(f"SMTP PASSWORD CONFIGURED: {bool(email_pass)}")
    print(f"DEFAULT FROM EMAIL: '{default_from}'")
    print(f"RECIPIENT (REGISTERED USER EMAIL): '{recipient}'\n")

    # Verify backend requirement
    if not email_host:
        print("[WARNING] REAL SMTP IS NOT CONFIGURED IN .env!")
        print("          EMAIL_HOST is empty. Django is using 'console.EmailBackend'.")
        print("          To enable real inbox email delivery:")
        print("          1. Create a .env file in the root project folder.")
        print("          2. Add:")
        print("             EMAIL_HOST=smtp.gmail.com")
        print("             EMAIL_PORT=587")
        print("             EMAIL_USE_TLS=True")
        print("             EMAIL_HOST_USER=your-email@gmail.com")
        print("             EMAIL_HOST_PASSWORD=your-gmail-app-password")
        print("             DEFAULT_FROM_EMAIL=your-email@gmail.com")
        print("\n====================================================")
        return False

    print(f"Attempting real SMTP network transmission to '{recipient}' via {email_host}:{email_port}...")

    try:
        sent_count = send_mail(
            subject="BudgetBuddy SMTP Real Test",
            message=f"Hello,\n\nThis is a real SMTP verification message sent to registered user email ({recipient}) from BudgetBuddy.",
            from_email=default_from,
            recipient_list=[recipient],
            fail_silently=False,
        )
        print("\nRESULT: REAL SMTP CONNECTION/SEND ACCEPTED")
        print(f"Sent Message Count: {sent_count}")
        print("Check inbox, spam, or promotions folder for delivery.")
        print("====================================================\n")
        return True
    except Exception as e:
        print(f"\nRESULT: REAL SMTP TRANSMISSION FAILED")
        print(f"EXCEPTION TYPE: {type(e).__name__}")
        print(f"EXACT ERROR MESSAGE: {str(e)}")
        print("====================================================\n")
        return False

if __name__ == '__main__':
    run_real_smtp_test()
