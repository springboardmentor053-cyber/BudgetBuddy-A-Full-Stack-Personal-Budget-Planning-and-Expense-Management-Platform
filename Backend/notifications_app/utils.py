import email
import traceback
from unittest import result
from django.utils import timezone
from .models import Notification
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def send_notification(user, title, message, notification_type="GENERAL", priority="LOW", event_date=None):
    print("========== SEND_NOTIFICATION ==========")
    print("User:", user)
    print("Title:", title)
    print("Type:", notification_type)

    if event_date is None:
        event_date = timezone.now().date()

    try:
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            event_date=event_date,
        )

        # Send email after saving the notification
        try:
            send_notification_email(user, title, message)
            print("📧 Notification email sent.")
        except Exception as e:
            print("❌ EMAIL FAILED")
            print("Exception Type:", type(e).__name__)
            print("Exception:", str(e))
            traceback.print_exc()

        print("✅ Notification Saved:", notification.id)
        return notification

    except Exception as e:
        print("❌ Notification Error:", e)
        raise


def send_notification_email(user, title, message):
    if not user.email:
        return

    subject = f"BudgetBuddy | {title}"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    # Debug logs safely outside constructor
    print("FROM:", from_email)
    print("TO:", recipient_list)
    print("USER EMAIL:", user.email)

    # Plain text fallback
    text_content = f"Hello {user.username},\n\n{message}\n\nPlease review your account in BudgetBuddy.\n\nThank you,\nBudgetBuddy Team"

    # Polished HTML Email Template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0f172a;
                color: #f8fafc;
                margin: 0;
                padding: 0;
            }}
            .email-wrapper {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #1e293b;
                border: 1px solid #334155;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                background: linear-gradient(135deg, #2563eb, #06b6d4);
                padding: 30px;
                text-align: center;
            }}
            .email-header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }}
            .email-body {{
                padding: 30px;
            }}
            .email-body h2 {{
                color: #ffffff;
                font-size: 20px;
                margin-top: 0;
            }}
            .email-body p {{
                color: #94a3b8;
                font-size: 15px;
                line-height: 1.6;
            }}
            .alert-box {{
                background-color: #0f172a;
                border-left: 4px solid #3b82f6;
                padding: 16px;
                border-radius: 12px;
                margin: 20px 0;
            }}
            .alert-box p {{
                margin: 0;
                color: #e2e8f0;
                font-weight: 500;
            }}
            .meta-info {{
                font-size: 12px;
                color: #64748b;
                margin-top: 15px;
            }}
            .btn-container {{
                text-align: center;
                margin-top: 30px;
            }}
            .btn {{
                background-color: #2563eb;
                color: #ffffff !important;
                padding: 12px 28px;
                border-radius: 14px;
                text-decoration: none;
                font-weight: 600;
                display: inline-block;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }}
            .email-footer {{
                background-color: #0f172a;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
                border-top: 1px solid #334155;
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-header">
                <h1>BudgetBuddy</h1>
            </div>
            <div class="email-body">
                <h2>Hello {user.username},</h2>
                <p>Here is an update regarding your personal finance activity:</p>
                
                <div class="alert-box">
                    <p><strong>{title}</strong></p>
                    <p style="margin-top: 8px; font-weight: normal;">{message}</p>
                </div>

                <p class="meta-info">
    Timestamp: {timezone.localtime().strftime('%B %d, %Y - %I:%M %p')}
</p>

                <div class="btn-container">
                    <a href="https://budget-buddy-a-full-stack-personal.vercel.app/dashboard" class="btn">
    Open BudgetBuddy
</a>
                </div>
            </div>
            <div class="email-footer">
                <p>&copy; 2026 BudgetBuddy. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Correct initialization of EmailMultiAlternatives
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=recipient_list
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)

    result = email.send(fail_silently=False)
    print("Email send result:", result)
    return result
