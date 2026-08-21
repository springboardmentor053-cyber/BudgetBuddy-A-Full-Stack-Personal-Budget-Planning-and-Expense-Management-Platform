from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Profile

class UserAuthAPITests(APITestCase):
    def setUp(self):
        # Create a sample user
        self.username = 'testuser'
        self.email = 'test@example.com'
        self.password = 'password123'
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )

    def test_registration_success(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post('/api/users/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertEqual(response.data['email'], 'new@example.com')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_registration_duplicate_username(self):
        data = {
            'username': self.username,
            'email': 'different@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/users/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_registration_missing_fields(self):
        data = {
            'email': 'newuser@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/users/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_login_success(self):
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post('/api/token/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        data = {
            'username': self.username,
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/token/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_token_refresh(self):
        # First login to get refresh token
        login_data = {
            'username': self.username,
            'password': self.password
        }
        login_response = self.client.post('/api/token/', login_data)
        refresh_token = login_response.data['refresh']

        # Request new access token using refresh token
        refresh_data = {
            'refresh': refresh_token
        }
        response = self.client.post('/api/token/refresh/', refresh_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_refresh_invalid(self):
        refresh_data = {
            'refresh': 'invalid_refresh_token_string'
        }
        response = self.client.post('/api/token/refresh/', refresh_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        # Force authentication
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.username)
        self.assertEqual(response.data['email'], self.email)
        self.assertTrue(response.data['email_notifications_enabled'])

    def test_get_profile_unauthenticated(self):
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'email': 'updated@example.com',
            'email_notifications_enabled': False
        }
        response = self.client.put('/api/users/profile/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'updated@example.com')
        self.assertFalse(response.data['email_notifications_enabled'])

        # Verify database update
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'updated@example.com')
        profile = Profile.objects.get(user=self.user)
        self.assertFalse(profile.email_notifications_enabled)
