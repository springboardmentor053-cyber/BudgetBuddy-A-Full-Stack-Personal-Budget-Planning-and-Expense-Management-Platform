from django.urls import path

from .views import (
    register_user,
    current_user,
    protected_view,
)


urlpatterns = [

    # =================================================
    # REGISTER
    # =================================================

    path(
        "register/",
        register_user,
        name="register",
    ),

    # =================================================
    # CURRENT LOGGED-IN USER
    # =================================================

    path(
        "me/",
        current_user,
        name="current-user",
    ),

    # =================================================
    # PROTECTED TEST
    # =================================================

    path(
        "protected/",
        protected_view,
        name="protected",
    ),
]