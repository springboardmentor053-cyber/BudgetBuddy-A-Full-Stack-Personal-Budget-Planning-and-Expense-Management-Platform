import sys
import smtplib
import traceback

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Send a temporary test email using the configured SMTP backend."

    def handle(self, *args, **options):
        smtp_responses = []
        original_sendmail = smtplib.SMTP.sendmail
        original_ssl_sendmail = smtplib.SMTP_SSL.sendmail

        def capture_sendmail(smtp, from_addr, to_addrs, msg, mail_options=(), rcpt_options=()):
            response = original_sendmail(
                smtp,
                from_addr,
                to_addrs,
                msg,
                mail_options=mail_options,
                rcpt_options=rcpt_options,
            )
            smtp_responses.append(response)
            return response

        def capture_ssl_sendmail(smtp, from_addr, to_addrs, msg, mail_options=(), rcpt_options=()):
            response = original_ssl_sendmail(
                smtp,
                from_addr,
                to_addrs,
                msg,
                mail_options=mail_options,
                rcpt_options=rcpt_options,
            )
            smtp_responses.append(response)
            return response

        smtplib.SMTP.sendmail = capture_sendmail
        smtplib.SMTP_SSL.sendmail = capture_ssl_sendmail

        try:
            response = send_mail(
                subject="BudgetBuddy test email",
                message="This is a temporary BudgetBuddy SMTP test email.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["xyz699911@gmail.com"],
                fail_silently=False,
            )
            print(smtp_responses if smtp_responses else response)
        except Exception as exc:
            print(repr(exc))
            traceback.print_exc(file=sys.stdout)
        finally:
            smtplib.SMTP.sendmail = original_sendmail
            smtplib.SMTP_SSL.sendmail = original_ssl_sendmail
