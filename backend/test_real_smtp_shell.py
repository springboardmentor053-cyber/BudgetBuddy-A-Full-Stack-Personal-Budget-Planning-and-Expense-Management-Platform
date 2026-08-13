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

print("====================================================")
print("REAL DJANGO SMTP SHELL TRANSMISSION TEST")
print("====================================================\n")

print("1. RUNTIME CONFIGURATION CHECK:")
print(f"   EMAIL_BACKEND       : {getattr(settings, 'EMAIL_BACKEND', 'NOT SET')}")
print(f"   EMAIL_HOST          : '{getattr(settings, 'EMAIL_HOST', '')}'")
print(f"   EMAIL_PORT          : {getattr(settings, 'EMAIL_PORT', 587)}")
print(f"   EMAIL_USE_TLS       : {getattr(settings, 'EMAIL_USE_TLS', True)}")
print(f"   EMAIL_HOST_USER     : '{getattr(settings, 'EMAIL_HOST_USER', '')}'")
print(f"   DEFAULT_FROM_EMAIL  : '{getattr(settings, 'DEFAULT_FROM_EMAIL', '')}'")

test_recipient = getattr(settings, 'EMAIL_HOST_USER', '') or 'test_authenticated_user@example.com'

print(f"\n2. EXECUTING send_mail(fail_silently=False) TO '{test_recipient}':")

if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
    print("   [INFO] Active EMAIL_BACKEND is 'console.EmailBackend'.")
    print("          Reason: EMAIL_HOST is empty ('') because no SMTP server credentials were set in .env.")
    print("          Console backend will write output to stdout below:\n")

try:
    sent_count = send_mail(
        "BudgetBuddy SMTP Test",
        "This is a real SMTP test from BudgetBuddy.",
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@budgetbuddy.com'),
        [test_recipient],
        fail_silently=False,
    )
    print(f"\n   [SUCCESS] send_mail() returned: {sent_count} email message(s) accepted.")
    if settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
        print("   [STATUS] SMTP server accepted the message for network transmission!")
    else:
        print("   [STATUS] Message rendered via console backend. To send via network SMTP, set EMAIL_HOST and EMAIL_HOST_USER in .env.")
except Exception as e:
    print(f"\n   [EXCEPTION] send_mail() raised exception: {type(e).__name__}: {str(e)}")

print("\n====================================================")
