from django.urls import path

from .views import (
    RegisterView,
    ProfileView,
    ChangePasswordView,
)


urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    path(
        "profile/change-password/",
        ChangePasswordView.as_view(),
        name="change-password"
    ),

]