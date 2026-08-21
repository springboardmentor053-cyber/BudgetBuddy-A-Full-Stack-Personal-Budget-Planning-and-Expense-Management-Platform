from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create demo user if it does not exist"

    def handle(self, *args, **kwargs):
        username = "demo_sahana22"
        password = "budget123456"

        user, created = User.objects.get_or_create(
            username=username
        )

        user.set_password(password)
        user.is_active = True
        user.save()

        if created:
            self.stdout.write(
                self.style.SUCCESS(f"Created user: {username}")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Updated user: {username}")
            )