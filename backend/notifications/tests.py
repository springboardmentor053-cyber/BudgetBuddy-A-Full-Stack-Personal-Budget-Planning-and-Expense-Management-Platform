from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from notifications.models import Notification


class NotificationAPITests(APITestCase):
    """
    Test suite for Notifications API, status updates (read/archived), and user isolation.
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="notif_user1",
            email="notif1@example.com",
            password="Password123!",
        )
        self.user2 = User.objects.create_user(
            username="notif_user2",
            email="notif2@example.com",
            password="Password123!",
        )

        self.list_url = reverse("notifications-list")

        # Initial notifications for user1
        self.notif1 = Notification.objects.create(
            user=self.user1,
            title="Budget Alert - Food",
            message="You have used 85% of your monthly Food budget.",
            notification_type="BUDGET_WARNING",
            priority="MEDIUM",
            is_read=False,
        )
        self.notif2 = Notification.objects.create(
            user=self.user1,
            title="Goal Completed - Laptop",
            message="Congratulations! You completed your savings goal.",
            notification_type="GOAL_COMPLETED",
            priority="HIGH",
            is_read=True,
        )

        # Notification for user2
        self.notif_user2 = Notification.objects.create(
            user=self.user2,
            title="User 2 Notification",
            message="Private alert for user 2.",
            notification_type="SAVINGS_REMINDER",
            priority="LOW",
        )

        self.client.force_authenticate(user=self.user1)

    def test_list_notifications_user_isolation(self):
        """
        Ensure user only retrieves their own notifications.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertEqual(len(data), 2)
        titles = [item["title"] for item in data]
        self.assertIn("Budget Alert - Food", titles)
        self.assertIn("Goal Completed - Laptop", titles)
        self.assertNotIn("User 2 Notification", titles)

    def test_create_notification(self):
        """
        Ensure notification can be created for the authenticated user.
        """
        payload = {
            "title": "Monthly Summary Available",
            "message": "Your August financial summary is ready for review.",
            "notification_type": "MONTHLY_REPORT",
            "priority": "LOW",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Monthly Summary Available")
        self.assertEqual(response.data["notification_type"], "MONTHLY_REPORT")

    def test_mark_notification_as_read(self):
        """
        Ensure user can update notification is_read status to True.
        """
        detail_url = reverse("notifications-detail", kwargs={"pk": self.notif1.id})
        response = self.client.patch(detail_url, {"is_read": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_archive_notification(self):
        """
        Ensure user can archive a notification.
        """
        detail_url = reverse("notifications-detail", kwargs={"pk": self.notif1.id})
        response = self.client.patch(detail_url, {"is_archived": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_archived)

    def test_delete_notification(self):
        """
        Ensure user can delete a notification.
        """
        detail_url = reverse("notifications-detail", kwargs={"pk": self.notif2.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Notification.objects.filter(id=self.notif2.id).exists())

    def test_cannot_access_other_user_notification(self):
        """
        Ensure user cannot view or edit notifications of another user.
        """
        detail_url = reverse("notifications-detail", kwargs={"pk": self.notif_user2.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
