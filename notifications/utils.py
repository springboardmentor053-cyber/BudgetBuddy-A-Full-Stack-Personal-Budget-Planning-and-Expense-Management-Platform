# from django.core.mail import send_mail

from .models import Notification
from .email_service import  send_notification_email
# from django.conf import settings

# def create_notification(user, title, message):

#     Notification.objects.create(
#         user=user,
#         title=title,
#         message=message
#     )
#     if user.email:
#         send_notification_email(
#                 user,
#                 title,
#                 message
#         )
def create_notification(user, title, message):

    print("🔔 CREATE_NOTIFICATION CALLED")
    print("User:", user.username)
    print("Title:", title)
    print("Message:", message)

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message
    )

    print("✅ NOTIFICATION CREATED")
    print("Notification ID:", notification.id)
    print("Is Read:", notification.is_read)

    if user.email:
        send_notification_email(
            user,
            title,
            message
        )



def goal_created(goal):

    create_notification(
        goal.user,
        "🎯 New Goal Created",
        f"Your savings goal '{goal.goal_name}' has been created successfully."
    )


def goal_completed(goal):

    create_notification(
        goal.user,
        "🏆 Goal Completed",
        f"Congratulations! You completed '{goal.goal_name}'."
    )


def savings_updated(goal, amount):

    create_notification(
        goal.user,
        "💰 Savings Updated",
        f"₹{amount} added to '{goal.goal_name}'."
    )


def milestone(goal, percentage):

    create_notification(
        goal.user,
        "📈 Milestone Reached",
        f"You've reached {percentage}% of your '{goal.goal_name}' goal."
    )


def due_tomorrow(goal):

    create_notification(
        goal.user,
        "⏰ Goal Due Tomorrow",
        f"'{goal.goal_name}' is due tomorrow."
    )