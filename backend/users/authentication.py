"""Authentication backends used by BudgetBuddy."""

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

User = get_user_model()

class UsernameOrEmailBackend(ModelBackend):
    """Authenticate an active user with either their username or email."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        """Return a matching active user, or ``None`` for any invalid input."""
        identifier = username or kwargs.get('email') or kwargs.get('username')

        if not identifier or not password:
            return None

        try:
            user = User.objects.filter(
                Q(username__iexact=identifier) | Q(email__iexact=identifier)
            ).first()
            if user and user.check_password(password) and self.user_can_authenticate(user):
                return user
        except Exception:
            # Authentication failures must become a normal invalid-credentials
            # response, never an unhandled 500 error.
            return None

        return None
