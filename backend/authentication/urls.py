from django.urls import path
from .views import RegisterView  # Import RegisterView here

urlpatterns = [
    # ... your existing login/token urls ...
    path('register/', RegisterView.as_view(), name='register'),
]