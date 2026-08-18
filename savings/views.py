from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from notifications.models import Notification
from notifications.email_service import send_notification_email

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer


class SavingsGoalViewSet(viewsets.ModelViewSet):

    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    # =====================================================
    # GET USER'S SAVINGS GOALS
    # =====================================================

    def get_queryset(self):

        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    # =====================================================
    # CREATE SAVINGS GOAL
    # =====================================================

    def perform_create(self, serializer):

        goal = serializer.save(
            user=self.request.user
        )

        notification = Notification.objects.create(

            user=self.request.user,

            title="Savings Goal Created",

            message=(
                f"Your savings goal "
                f"'{goal.goal_name}' "
                f"has been created successfully."
            ),

            notification_type="savings_created",

            priority="medium",
        )

        send_notification_email(notification)

    # =====================================================
    # UPDATE SAVINGS GOAL
    # =====================================================

    def perform_update(self, serializer):

        old_goal = self.get_object()

        # Was the goal already completed before this update?
        was_completed = (
            old_goal.saved_amount >= old_goal.target_amount
        )

        # Save the updated goal
        goal = serializer.save()

        # Is the goal completed after this update?
        is_completed = (
            goal.saved_amount >= goal.target_amount
        )

        # -------------------------------------------------
        # Goal became completed NOW
        # -------------------------------------------------

        if is_completed and not was_completed:

            notification = Notification.objects.create(

                user=self.request.user,

                title="Savings Goal Completed",

                message=(
                    f"Congratulations! You have completed "
                    f"your savings goal "
                    f"'{goal.goal_name}'."
                ),

                notification_type="savings_completed",

                priority="high",
            )

            send_notification_email(notification)

        # -------------------------------------------------
        # Normal update
        # -------------------------------------------------

        else:

            notification = Notification.objects.create(

            user=self.request.user,

            title="Savings Goal Updated",

            message=(
                f"Your savings goal "
                f"'{goal.goal_name}' "
                f"has been updated successfully."
            ),

            notification_type="savings_updated",

            priority="low",
        )

        send_notification_email(notification)

    # =====================================================
    # DELETE SAVINGS GOAL
    # =====================================================

    def perform_destroy(self, instance):

        goal_name = instance.goal_name
        target_amount = instance.target_amount
        saved_amount = instance.saved_amount

        notification = Notification.objects.create(

            user=self.request.user,

            title="Savings Goal Deleted",

            message=(
                f"Your savings goal "
                f"'{goal_name}' "
                f"with a target of ₹{target_amount} "
                f"was deleted successfully."
            ),

            notification_type="savings_deleted",

            priority="medium",
        )

        send_notification_email(notification)

        instance.delete()