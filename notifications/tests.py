import datetime
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Notification
from savings.models import SavingsGoal
from budgets.models import Budget
from expenses.models import Expense

class NotificationAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.other_user = User.objects.create_user(username='otheruser', password='password123')
        
        # Authenticate main user
        self.client.force_authenticate(user=self.user)
        
        # Future date for savings goal tests
        self.future_date = (datetime.date.today() + datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        
        # Clear welcome notifications generated on user creation
        Notification.objects.all().delete()

    def test_create_notification_valid(self):
        data = {
            'title': 'Test Title',
            'message': 'Test Message content.',
            'notification_type': 'General',
            'priority': 'Low'
        }
        response = self.client.post('/api/notifications/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Title')
        self.assertEqual(response.data['message'], 'Test Message content.')
        self.assertFalse(response.data['is_read'])  # defaults to False

    def test_list_notifications_only_returns_own_notifications(self):
        # Create own notification
        Notification.objects.create(
            user=self.user,
            title='Own Notification',
            message='Test message',
            notification_type='General',
            priority='Low'
        )
        # Create other user's notification
        Notification.objects.create(
            user=self.other_user,
            title='Other Notification',
            message='Other test message',
            notification_type='General',
            priority='Low'
        )
        
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Own Notification')

    def test_retrieve_single_notification(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Test Title',
            message='Test message',
            notification_type='General',
            priority='Low'
        )
        response = self.client.get(f'/api/notifications/{notif.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Title')

    def test_cannot_retrieve_others_notification(self):
        notif = Notification.objects.create(
            user=self.other_user,
            title='Other Title',
            message='Other test message',
            notification_type='General',
            priority='Low'
        )
        response = self.client.get(f'/api/notifications/{notif.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_notification_ignores_is_read_field(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Test Title',
            message='Test message',
            notification_type='General',
            priority='Low',
            is_read=False
        )
        data = {
            'title': 'Updated Title',
            'is_read': True  # Should be ignored as it is read-only
        }
        response = self.client.patch(f'/api/notifications/{notif.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')
        
        # Verify from database that is_read remains False
        notif.refresh_from_db()
        self.assertFalse(notif.is_read)

    def test_delete_notification(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Test Title',
            message='Test message',
            notification_type='General',
            priority='Low'
        )
        response = self.client.delete(f'/api/notifications/{notif.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Notification.objects.filter(id=notif.id).exists())

    def test_mark_as_read_api(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Unread Title',
            message='Unread message',
            notification_type='General',
            priority='Low',
            is_read=False
        )
        
        # Mark as read using POST to /read/
        response = self.client.post(f'/api/notifications/{notif.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_read'], True)
        
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_unauthenticated_api_access_denied(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_signal_savings_goal_created(self):
        # Clear existing notifications
        Notification.objects.all().delete()
        
        # Create a SavingsGoal
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='Europe Trip',
            target_amount=5000.00,
            saved_amount=500.00,
            target_date=self.future_date,
            status='In Progress'
        )
        
        # Verify notification was automatically created
        notifs = Notification.objects.filter(user=self.user, notification_type='Savings')
        self.assertEqual(notifs.count(), 1)
        self.assertEqual(notifs[0].title, 'Savings Goal Created')
        self.assertIn('Europe Trip', notifs[0].message)

    def test_signal_savings_goal_completed(self):
        # Create an In Progress goal
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='Europe Trip',
            target_amount=5000.00,
            saved_amount=500.00,
            target_date=self.future_date,
            status='In Progress'
        )
        
        # Clear notifications
        Notification.objects.all().delete()
        
        # Update goal to be completed
        goal.saved_amount = 5000.00
        goal.save()  # custom save will set status to Completed
        
        # Verify notification was automatically created
        notifs = Notification.objects.filter(user=self.user, title='Savings Goal Completed')
        self.assertEqual(notifs.count(), 1)
        self.assertIn('completed', notifs[0].message.lower())

    def test_signal_budget_created(self):
        Notification.objects.all().delete()
        
        # Create a Budget
        budget = Budget.objects.create(
            user=self.user,
            category='FOOD',
            limit_amount=800.00,
            month='August'
        )
        
        # Verify notification was automatically created
        notifs = Notification.objects.filter(user=self.user, title='Budget Created')
        self.assertEqual(notifs.count(), 1)
        self.assertIn('800.00', notifs[0].message)

    def test_signal_budget_updated(self):
        # Create a Budget
        budget = Budget.objects.create(
            user=self.user,
            category='FOOD',
            limit_amount=800.00,
            month='August'
        )
        
        Notification.objects.all().delete()
        
        # Update Budget
        budget.limit_amount = 1000.00
        budget.save()
        
        # Verify notification was automatically created
        notifs = Notification.objects.filter(user=self.user, title='Budget Updated')
        self.assertEqual(notifs.count(), 1)
        self.assertIn('1000.00', notifs[0].message)

    def test_expense_triggers_budget_exceeded_notification(self):
        # Create Budget
        budget = Budget.objects.create(
            user=self.user,
            category='FOOD',
            limit_amount=100.00,
            month=datetime.date.today().strftime('%B')
        )
        Notification.objects.all().delete()

        # Create Expense exceeding budget
        Expense.objects.create(
            user=self.user,
            category='FOOD',
            amount=120.00,
            date=datetime.date.today()
        )

        notifs = Notification.objects.filter(user=self.user, title='Budget Limit Exceeded')
        self.assertEqual(notifs.count(), 1)
        self.assertIn('exceeded', notifs[0].message.lower())

    def test_expense_update_triggers_budget_exceeded_notification(self):
        # Create Budget
        budget = Budget.objects.create(
            user=self.user,
            category='TRAVEL',
            limit_amount=100.00,
            month=datetime.date.today().strftime('%B')
        )
        
        # Create Expense within budget
        expense = Expense.objects.create(
            user=self.user,
            category='TRAVEL',
            amount=50.00,
            date=datetime.date.today()
        )
        
        Notification.objects.all().delete()

        # Update Expense to exceed budget
        expense.amount = 150.00
        expense.save()

        notifs = Notification.objects.filter(user=self.user, title='Budget Limit Exceeded')
        self.assertEqual(notifs.count(), 1)

    def test_budget_update_triggers_budget_exceeded_notification(self):
        # Create Budget within limits
        budget = Budget.objects.create(
            user=self.user,
            category='SHOPPING',
            limit_amount=200.00,
            month=datetime.date.today().strftime('%B')
        )
        
        # Create Expense
        Expense.objects.create(
            user=self.user,
            category='SHOPPING',
            amount=150.00,
            date=datetime.date.today()
        )
        
        Notification.objects.all().delete()

        # Lower the Budget limit so it is exceeded
        budget.limit_amount = 100.00
        budget.save()

        notifs = Notification.objects.filter(user=self.user, title='Budget Limit Exceeded')
        self.assertEqual(notifs.count(), 1)

    def test_savings_goal_milestone_notifications(self):
        # Create SavingsGoal
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='Car',
            target_amount=1000.00,
            saved_amount=0.00,
            target_date=self.future_date,
            status='Pending'
        )
        Notification.objects.all().delete()

        # Save to 50%
        goal.saved_amount = 500.00
        goal.save()
        
        notifs = Notification.objects.filter(user=self.user, title='Savings Goal Milestone Reached')
        self.assertEqual(notifs.count(), 1)
        self.assertIn('50%', notifs[0].message)

        # Clear notifications
        Notification.objects.all().delete()

        # Save to 90%
        goal.saved_amount = 900.00
        goal.save()

        notifs = Notification.objects.filter(user=self.user, title='Savings Goal Milestone Reached')
        self.assertEqual(notifs.count(), 1)
        self.assertIn('90%', notifs[0].message)

    def test_mark_as_read_api_via_patch_read_url(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Test Title',
            message='Test message',
            notification_type='General',
            priority='Low',
            is_read=False
        )
        
        # Call the correct patch endpoint `/read/`
        response = self.client.patch(f'/api/notifications/{notif.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_savings_expense_adds_to_savings_goal(self):
        # Create SavingsGoal
        goal = SavingsGoal.objects.create(
            user=self.user,
            goal_name='Laptop',
            target_amount=1000.00,
            saved_amount=100.00,
            target_date=self.future_date,
            status='In Progress'
        )
        
        # Create Savings category Expense
        Expense.objects.create(
            user=self.user,
            category='SAVINGS',
            amount=250.00,
            date=datetime.date.today(),
            description='Saving for my Laptop'
        )
        
        # Refresh and check
        goal.refresh_from_db()
        self.assertEqual(float(goal.saved_amount), 350.00)

    def test_email_notification_sent_when_profile_enabled(self):
        from django.core import mail
        from users.models import Profile
        
        # Ensure user has email
        self.user.email = 'test@example.com'
        self.user.save()
        
        # Enable email notifications in profile
        profile, _ = Profile.objects.get_or_create(user=self.user)
        profile.email_notifications_enabled = True
        profile.save()
        
        # Create notification
        Notification.objects.create(
            user=self.user,
            title='Test Email Title',
            message='Test Email Message Content.',
            notification_type='General',
            priority='High'
        )
        
        # Verify email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '[BudgetBuddy] Test Email Title')
        self.assertEqual(mail.outbox[0].body, 'Test Email Message Content.')
        self.assertEqual(mail.outbox[0].to, ['test@example.com'])

    def test_email_notification_not_sent_when_profile_disabled(self):
        from django.core import mail
        from users.models import Profile
        
        self.user.email = 'test@example.com'
        self.user.save()
        
        profile, _ = Profile.objects.get_or_create(user=self.user)
        profile.email_notifications_enabled = False
        profile.save()
        
        # Clear outbox
        mail.outbox = []
        
        Notification.objects.create(
            user=self.user,
            title='Test Email Title',
            message='Test Email Message Content.',
            notification_type='General',
            priority='High'
        )
        
        # Verify no email was sent
        self.assertEqual(len(mail.outbox), 0)

    def test_budget_creation_triggers_email(self):
        from django.core import mail
        from users.models import Profile
        
        self.user.email = 'test@example.com'
        self.user.save()
        
        profile, _ = Profile.objects.get_or_create(user=self.user)
        profile.email_notifications_enabled = True
        profile.save()
        
        mail.outbox = []
        
        # Create a Budget
        Budget.objects.create(
            user=self.user,
            category='FOOD',
            limit_amount=800.00,
            month='August'
        )
        
        # Verify email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '[BudgetBuddy] Budget Created')
        self.assertIn('800.00', mail.outbox[0].body)

    def test_user_registration_triggers_welcome_notification_and_email(self):
        from django.core import mail
        
        mail.outbox = []
        
        # Create a new user with email
        new_user = User.objects.create_user(username='newregistereduser', email='new@example.com', password='password123')
        
        # Verify welcome notification was created
        notifs = Notification.objects.filter(user=new_user, title='Welcome to BudgetBuddy!')
        self.assertEqual(notifs.count(), 1)
        
        # Verify welcome email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '[BudgetBuddy] Welcome to BudgetBuddy!')
        self.assertEqual(mail.outbox[0].to, ['new@example.com'])


