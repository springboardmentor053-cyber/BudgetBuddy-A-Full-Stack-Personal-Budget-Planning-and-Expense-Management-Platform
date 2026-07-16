from rest_framework.routers import DefaultRouter

from .views import BudgetViewSet

router = DefaultRouter()
router.register(r"budgets", BudgetViewSet, basename="budget")

urlpatterns = router.urls