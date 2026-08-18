from django.urls import path
from .views import ChangePasswordAPIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import ProfileAPIView
from .views import (
    RegisterView,
    # NotificationListView,
    # NotificationReadView,
)

urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
    path(
    "profile/",
    ProfileAPIView.as_view(),
    ),
    path(
    "change-password/",
    ChangePasswordAPIView.as_view(),
    ),

    # path(
    #     "notifications/",
    #     NotificationListView.as_view(),
    #     name="notifications"
    # ),

    # path(
    #     "notifications/<int:pk>/",
    #     NotificationReadView.as_view(),
    #     name="notification-read"
    # ),

]