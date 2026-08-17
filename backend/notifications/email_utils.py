import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.utils import timezone
from django.utils.html import escape


logger = logging.getLogger(__name__)


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
