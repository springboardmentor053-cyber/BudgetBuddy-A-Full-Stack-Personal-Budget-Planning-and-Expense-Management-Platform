from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    path("admin/", admin.site.urls),

    # Authentication
    path("api/", include("accounts.urls")),

    # New Expense App
    path("api/expense/", include("expenses.urls")),

    # Income App
    path("api/income/", include("income.urls")),

    # Budget App
    path("api/budget/", include("budgets.urls")),

]