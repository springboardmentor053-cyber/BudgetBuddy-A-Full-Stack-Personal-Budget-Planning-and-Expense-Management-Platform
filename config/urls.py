from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

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

    #Savings App
    path("api/savings/", include("savings.urls")),

    path("api/notifications/",include("notifications.urls")),

    path("api/analytics/", include("analytics.urls")),
    path("api/reports/", include("reports.urls")),
]   
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )