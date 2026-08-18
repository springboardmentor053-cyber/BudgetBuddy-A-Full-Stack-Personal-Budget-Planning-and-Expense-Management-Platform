"""Authentication backends used by BudgetBuddy."""

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class UsernameOrEmailBackend(ModelBackend):
    """Authenticate an active user with either their username or email."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = (username or kwargs.get('email') or '').strip()

        if not identifier or password is None:
            return None

        UserModel = get_user_model()

        # Give a username match precedence in the unusual case that a username
        # is identical to another account's email address.
        user = UserModel._default_manager.filter(username__iexact=identifier).first()
        if user is None:
            user = UserModel._default_manager.filter(email__iexact=identifier).first()

        if user is not None and user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
