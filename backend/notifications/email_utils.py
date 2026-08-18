import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.utils import timezone
from django.utils.html import escape


logger = logging.getLogger(__name__)

RESEND_EMAILS_URL = "https://api.resend.com/emails"


def _send_resend_email(*, user, recipient, title, plain_message, html_message):
    """Send an email with Resend's HTTPS API without logging API credentials."""

    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [recipient],
        "subject": title,
        "text": plain_message,
        "html": html_message,
    }
    request = Request(
        RESEND_EMAILS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "BudgetBuddy/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=10) as response:
            if not 200 <= response.status < 300:
                logger.error(
                    "Resend email request failed for user %s with HTTP status %s.",
                    user.pk,
                    response.status,
                )
                return False

        logger.info("Resend notification email sent for user %s.", user.pk)
        return True
    except HTTPError as exc:
        logger.error(
            "Resend email request failed for user %s with HTTP status %s.",
            user.pk,
            exc.code,
        )
    except URLError as exc:
        logger.error(
            "Resend email connection failed for user %s: %s.",
            user.pk,
            exc.reason,
        )
    except Exception as exc:
        logger.error(
            "Resend email request failed for user %s: %s: %s",
            user.pk,
            type(exc).__name__,
            str(exc),
            exc_info=True,
        )

    return False


def send_notification_email(user, title, message):
    """Send a best-effort email notification to a user's registered address."""

    if not user:
        logger.warning("Notification email skipped because no user was supplied.")
        return False

    recipient = (user.email or "").strip()
    if not recipient:
        logger.warning(
            "Notification email skipped because user %s has no email address.",
            user.pk,
        )
        return False

    try:
        validate_email(recipient)
    except ValidationError:
        logger.warning(
            "Notification email skipped because user %s has an invalid email address.",
            user.pk,
        )
        return False

    plain_message = (
        f"BudgetBuddy\n\n{title}\n\n{message}\n\n"
        "This is an automated BudgetBuddy notification."
    )
    html_message = (
        "<html><body>"
        "<h2>BudgetBuddy</h2>"
        f"<h3>{escape(title)}</h3>"
        f"<p>{escape(message)}</p>"
        f"<p><small>Sent {timezone.localtime():%B %d, %Y, %I:%M %p %Z}</small></p>"
        "<p><small>This is an automated BudgetBuddy notification.</small></p>"
        "</body></html>"
    )

    if settings.RESEND_API_KEY:
        return _send_resend_email(
            user=user,
            recipient=recipient,
            title=title,
            plain_message=plain_message,
            html_message=html_message,
        )

    try:
        email = EmailMultiAlternatives(
            subject=title,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        email.attach_alternative(html_message, "text/html")
        sent_count = email.send(fail_silently=False)
        logger.info(
            "Notification email sent for user %s (messages sent: %s).",
            user.pk,
            sent_count,
        )
        return True
    except Exception as exc:
        # A delivery failure must not roll back the financial operation.
        logger.error(
            "Notification email failed for user %s: %s: %s",
            user.pk,
            type(exc).__name__,
            str(exc),
            exc_info=True,
        )
        return False
