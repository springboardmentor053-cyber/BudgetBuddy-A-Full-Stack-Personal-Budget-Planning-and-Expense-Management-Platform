import os
import sys
import django

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Try loading .env if python-dotenv is installed
try:
    import dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    if os.path.exists(env_path):
        dotenv.load_dotenv(env_path)
    backend_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(backend_env):
        dotenv.load_dotenv(backend_env)
except ImportError:
    pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.conf import settings
from django.core.mail import EmailMessage

print("====================================================")
print("DIAGNOSING BUDGETBUDDY EMAIL & SMTP FLOW")
print("====================================================\n")

print("1. RUNTIME DJANGO EMAIL SETTINGS:")
print(f"   EMAIL_BACKEND       : {getattr(settings, 'EMAIL_BACKEND', 'NOT SET')}")
print(f"   EMAIL_HOST          : '{getattr(settings, 'EMAIL_HOST', 'NOT SET')}'")
print(f"   EMAIL_PORT          : {getattr(settings, 'EMAIL_PORT', 'NOT SET')}")
print(f"   EMAIL_USE_TLS       : {getattr(settings, 'EMAIL_USE_TLS', 'NOT SET')}")
print(f"   EMAIL_HOST_USER     : '{getattr(settings, 'EMAIL_HOST_USER', 'NOT SET')}'")
print(f"   EMAIL_HOST_PASSWORD : {'*** (SET)' if getattr(settings, 'EMAIL_HOST_PASSWORD', '') else "'' (NOT SET)"}")
print(f"   DEFAULT_FROM_EMAIL  : '{getattr(settings, 'DEFAULT_FROM_EMAIL', 'NOT SET')}'")

print("\n2. ENVIRONMENT VARIABLES DETECTED:")
print(f"   EMAIL_HOST in os.environ         : '{os.environ.get('EMAIL_HOST', '')}'")
print(f"   EMAIL_HOST_USER in os.environ    : '{os.environ.get('EMAIL_HOST_USER', '')}'")
print(f"   EMAIL_HOST_PASSWORD in os.environ: {'***' if os.environ.get('EMAIL_HOST_PASSWORD') else 'EMPTY'}")

print("\n3. ACTUAL SMTP DELIVERY TEST (fail_silently=False):")
recipient = getattr(settings, 'EMAIL_HOST_USER', '') or os.environ.get('EMAIL_HOST_USER', '') or 'test_smtp@example.com'

if not getattr(settings, 'EMAIL_HOST', ''):
    print("   [FAIL] RESULT: SMTP configuration is INCOMPLETE/MISSING.")
    print("          Reason: EMAIL_HOST environment variable is not configured.")
    print("          Therefore, EMAIL_BACKEND defaults to 'django.core.mail.backends.console.EmailBackend'.")
    print("          Console Email Backend prints emails to backend stdout instead of connecting to an SMTP server.")
else:
    print(f"   Attempting to send SMTP test email to: {recipient} via {settings.EMAIL_HOST}:{settings.EMAIL_PORT}...")
    try:
        msg = EmailMessage(
            subject="BudgetBuddy SMTP Diagnostic Test",
            body="This is a test email from BudgetBuddy to verify real SMTP server delivery.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient]
        )
        msg.send(fail_silently=False)
        print("   [PASS] RESULT: REAL SMTP TEST EMAIL SENT SUCCESSFULLY!")
    except Exception as e:
        print(f"   [FAIL] RESULT: SMTP EMAIL DELIVERY FAILED!")
        print(f"          Exact Error: {type(e).__name__}: {str(e)}")

print("\n====================================================")
