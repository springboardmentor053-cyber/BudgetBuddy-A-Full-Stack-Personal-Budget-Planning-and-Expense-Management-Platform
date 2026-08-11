import calendar
from decimal import Decimal

from django.db.models import Q, Sum
from django.utils import timezone

from drf_spectacular.utils import extend_schema

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Expense
from notifications.models import Notification

from .models import Budget, SavingsGoal

from .serializers import (
    BudgetErrorSerializer,
    BudgetSerializer,
    BudgetSummaryResponseSerializer,
    SavingsGoalSerializer,
)


# ============================================================
# BUDGET VIEWSET
# ============================================================

class BudgetViewSet(viewsets.ModelViewSet):

    queryset = Budget.objects.all()

    serializer_class = BudgetSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Budget.objects.none()

        return Budget.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):

        budget = serializer.save(
            user=self.request.user
        )

        # Automatically create Budget Created notification
        Notification.objects.create(
            user=self.request.user,

            title=(
                f"Budget Created - "
                f"{budget.category}"
            ),

            message=(
                f"Your {budget.category} budget of "
                f"₹{budget.amount} for {budget.month} "
                f"has been created successfully."
            ),

            notification_type="BUDGET_CREATED",

            priority="MEDIUM",
        )

    def perform_update(self, serializer):

        budget = serializer.save()

        # Automatically create Budget Updated notification
        Notification.objects.create(
            user=self.request.user,

            title=(
                f"Budget Updated - "
                f"{budget.category}"
            ),

            message=(
                f"Your {budget.category} budget for "
                f"{budget.month} has been updated to "
                f"₹{budget.amount}."
            ),

            notification_type="BUDGET_UPDATED",

            priority="MEDIUM",
        )


# ============================================================
# SAVINGS GOAL VIEWSET
# ============================================================

class SavingsGoalViewSet(
    viewsets.ModelViewSet
):

    queryset = SavingsGoal.objects.all()

    serializer_class = SavingsGoalSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return SavingsGoal.objects.none()

        return SavingsGoal.objects.filter(
            user=self.request.user
        ).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):

        savings_goal = serializer.save(
            user=self.request.user
        )

        # Automatically create Savings Goal Created notification
        Notification.objects.create(
            user=self.request.user,

            title=(
                f"Savings Goal Created - "
                f"{savings_goal.title}"
            ),

            message=(
                f"Your '{savings_goal.title}' "
                f"savings goal with a target of "
                f"₹{savings_goal.target_amount} "
                f"has been created successfully."
            ),

            notification_type=(
                "SAVINGS_GOAL_CREATED"
            ),

            priority="MEDIUM",
        )

        # Check if the goal was already completed
        # when it was created

        if (
            savings_goal.target_amount > 0
            and
            savings_goal.saved_amount
            >= savings_goal.target_amount
        ):

            Notification.objects.get_or_create(
                user=self.request.user,

                notification_type=(
                    "GOAL_COMPLETED"
                ),

                title=(
                    f"Goal Completed - "
                    f"{savings_goal.title}"
                ),

                defaults={

                    "message": (
                        f"Congratulations! You "
                        f"completed your "
                        f"'{savings_goal.title}' "
                        f"savings goal."
                    ),

                    "priority": "HIGH",
                },
            )

    def perform_update(self, serializer):

        old_goal = self.get_object()

        old_saved_amount = (
            old_goal.saved_amount
        )

        savings_goal = serializer.save()

        # Check whether the goal was already completed
        was_completed = (
            old_goal.target_amount > 0
            and
            old_saved_amount
            >= old_goal.target_amount
        )

        # Check current completion status
        is_completed = (
            savings_goal.target_amount > 0
            and
            savings_goal.saved_amount
            >= savings_goal.target_amount
        )

        # Create completion notification
        # only when the goal becomes completed

        if (
            is_completed
            and not was_completed
        ):

            Notification.objects.get_or_create(

                user=self.request.user,

                notification_type=(
                    "GOAL_COMPLETED"
                ),

                title=(
                    f"Goal Completed - "
                    f"{savings_goal.title}"
                ),

                defaults={

                    "message": (
                        f"Congratulations! You "
                        f"completed your "
                        f"'{savings_goal.title}' "
                        f"savings goal."
                    ),

                    "priority": "HIGH",
                },
            )


# ============================================================
# BUDGET SUMMARY API
# ============================================================

class BudgetSummaryAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        BudgetSummaryResponseSerializer
    )

    @extend_schema(

        responses={
            200: (
                BudgetSummaryResponseSerializer
            ),

            400: BudgetErrorSerializer,
        },

        description=(
            "Return budget usage information "
            "for all budgets belonging to "
            "the authenticated user."
        ),
    )

    def get(self, request):

        user = request.user

        current_year = (
            timezone.now().year
        )

        budgets = (
            Budget.objects
            .filter(user=user)
            .order_by(
                "month",
                "category",
            )
        )

        budget_summary = []

        total_budget = Decimal(
            "0.00"
        )

        total_spent = Decimal(
            "0.00"
        )

        for budget in budgets:

            month_parts = (
                budget.month
                .strip()
                .split()
            )

            month_name = (
                month_parts[0]
                .capitalize()
            )

            if (
                len(month_parts) > 1
                and
                month_parts[1].isdigit()
            ):

                budget_year = int(
                    month_parts[1]
                )

            else:

                budget_year = (
                    current_year
                )

            try:

                month_number = list(
                    calendar.month_name
                ).index(
                    month_name
                )

            except ValueError:

                return Response(

                    {
                        "error": (
                            f"Invalid month "
                            f"'{budget.month}'. "
                            "Use July or July 2026."
                        )
                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                )

            spent = (

                Expense.objects

                .filter(

                    user=user,

                    category=(
                        budget.category
                    ),

                    date__month=(
                        month_number
                    ),

                    date__year=(
                        budget_year
                    ),
                )

                .aggregate(
                    total=Sum("amount")
                )["total"]

                or Decimal("0.00")
            )

            remaining = (
                budget.amount - spent
            )

            if remaining >= 0:

                budget_status = (
                    "Within Budget"
                )

            else:

                budget_status = (
                    "Over Budget"
                )

            if budget.amount > 0:

                percentage_used = round(

                    float(

                        (
                            spent
                            / budget.amount
                        )

                        * 100
                    ),

                    2,
                )

            else:

                percentage_used = 0.0

            budget_summary.append(

                {

                    "id": budget.id,

                    "category": (
                        budget.category
                    ),

                    "month": month_name,

                    "year": budget_year,

                    "budget_amount": (
                        budget.amount
                    ),

                    "spent_amount": spent,

                    "remaining_amount": (
                        remaining
                    ),

                    "percentage_used": (
                        percentage_used
                    ),

                    "status": (
                        budget_status
                    ),
                }
            )

            total_budget += (
                budget.amount
            )

            total_spent += spent

        total_remaining = (
            total_budget
            - total_spent
        )

        return Response(

            {

                "total_budget": (
                    total_budget
                ),

                "total_spent": (
                    total_spent
                ),

                "total_remaining": (
                    total_remaining
                ),

                "budgets": (
                    budget_summary
                ),
            },

            status=status.HTTP_200_OK,
        )


# ============================================================
# BUDGET ALERT API
# ============================================================

class BudgetAlertAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        category = (
            request.query_params.get(
                "category"
            )
        )

        month = (
            request.query_params.get(
                "month"
            )
        )

        # ----------------------------------------------------
        # CATEGORY REQUIRED
        # ----------------------------------------------------

        if not category:

            return Response(

                {
                    "error": (
                        "Please provide a "
                        "budget category."
                    )
                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        # ----------------------------------------------------
        # DEFAULT MONTH
        # ----------------------------------------------------

        if not month:

            month = (
                timezone.now()
                .strftime("%B")
            )

        current_year = (
            timezone.now().year
        )

        month_parts = (
            month
            .strip()
            .split()
        )

        month_name = (
            month_parts[0]
            .capitalize()
        )

        # ----------------------------------------------------
        # GET YEAR
        # ----------------------------------------------------

        if (
            len(month_parts) > 1
            and
            month_parts[1].isdigit()
        ):

            budget_year = int(
                month_parts[1]
            )

        else:

            budget_year = (
                current_year
            )

        # ----------------------------------------------------
        # GET MONTH NUMBER
        # ----------------------------------------------------

        try:

            month_number = list(
                calendar.month_name
            ).index(
                month_name
            )

        except ValueError:

            return Response(

                {
                    "error": (
                        f"Invalid month "
                        f"'{month}'. "
                        "Use July or July 2026."
                    )
                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        # ----------------------------------------------------
        # FIND USER'S BUDGET
        # ----------------------------------------------------

        budget = (

            Budget.objects

            .filter(

                user=user,

                category=category,
            )

            .filter(

                Q(
                    month__iexact=(
                        month_name
                    )
                )

                |

                Q(
                    month__iexact=(
                        f"{month_name} "
                        f"{budget_year}"
                    )
                )
            )

            .first()
        )

        # ----------------------------------------------------
        # BUDGET NOT FOUND
        # ----------------------------------------------------

        if not budget:

            return Response(

                {
                    "error": (
                        f"No budget found for "
                        f"{category} - "
                        f"{month_name} "
                        f"{budget_year}."
                    )
                },

                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )

        # ----------------------------------------------------
        # CALCULATE TOTAL EXPENSE
        # ----------------------------------------------------

        total_expense = (

            Expense.objects

            .filter(

                user=user,

                category=category,

                date__month=(
                    month_number
                ),

                date__year=(
                    budget_year
                ),
            )

            .aggregate(
                total=Sum("amount")
            )["total"]

            or Decimal("0.00")
        )

        # ----------------------------------------------------
        # CALCULATE UTILIZATION
        # ----------------------------------------------------

        if budget.amount > 0:

            utilization = (

                total_expense
                / budget.amount

            ) * Decimal("100")

        else:

            utilization = Decimal(
                "0.00"
            )

        utilization = round(

            float(utilization),

            2,
        )

        # ----------------------------------------------------
        # DETERMINE ALERT LEVEL
        # ----------------------------------------------------

        if utilization >= 100:

            alert_level = (
                "EXCEEDED"
            )

            alert_message = (

                f"Your {category} "
                f"Budget has been exceeded."
            )

        elif utilization >= 90:

            alert_level = (
                "HIGH"
            )

            alert_message = (

                f"You have used "
                f"{utilization}% "
                f"of your monthly "
                f"{category} Budget."
            )

        elif utilization >= 80:

            alert_level = (
                "WARNING"
            )

            alert_message = (

                f"You have used "
                f"{utilization}% "
                f"of your monthly "
                f"{category} Budget."
            )

        else:

            alert_level = (
                "NORMAL"
            )

            alert_message = (

                f"You have used "
                f"{utilization}% "
                f"of your monthly "
                f"{category} Budget."
            )

        # ----------------------------------------------------
        # RETURN RESPONSE
        # ----------------------------------------------------

        return Response(

            {

                "category": (
                    budget.category
                ),

                "budget_amount": (
                    budget.amount
                ),

                "total_expense": (
                    total_expense
                ),

                "budget_utilization_percentage": (
                    utilization
                ),

                "alert_level": (
                    alert_level
                ),

                "alert_message": (
                    alert_message
                ),
            },

            status=status.HTTP_200_OK,
        )