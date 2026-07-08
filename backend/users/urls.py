from django.urls import path
from .views import register_user, protected_view

urlpatterns = [
    path('register/', register_user, name='register'),
    path('protected/', protected_view, name='protected'),
]