from django.contrib.auth import get_user_model
from django.test import RequestFactory
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthFlowTests(APITestCase):
    def test_username_or_email_backend_handles_missing_credentials(self):
        from users.authentication import UsernameOrEmailBackend

        backend = UsernameOrEmailBackend()
        request = RequestFactory().post('/api/auth/login/')

        self.assertIsNone(backend.authenticate(request))
        self.assertIsNone(backend.authenticate(request, username='student1'))
        self.assertIsNone(backend.authenticate(request, password='StrongPass123'))

    def test_user_can_register_and_login(self):
        register_url = reverse('register')
        login_url = reverse('login')
        profile_url = reverse('profile')

        self.assertEqual(register_url, '/api/auth/register/')
        self.assertEqual(login_url, '/api/auth/login/')

        payload = {
            'username': 'student1',
            'email': 'student1@example.com',
            'password': 'StrongPass123',
            'password_confirm': 'StrongPass123',
            'role': 'student',
        }

        response = self.client.post(register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='student1').exists())

        login_response = self.client.post(
            login_url,
            {'username': 'student1', 'password': 'StrongPass123'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")
        profile_response = self.client.get(profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['username'], 'student1')

    def test_user_can_login_with_case_insensitive_username_or_email(self):
        user = User.objects.create_user(
            username='varshini',
            email='varshini@gmail.com',
            password='Password123!',
            role='student',
        )
        login_url = reverse('login')

        for identifier in ('Varshini', 'VARSHINI@GMAIL.COM'):
            with self.subTest(identifier=identifier):
                response = self.client.post(
                    login_url,
                    {'username': identifier, 'password': 'Password123!'},
                    format='json',
                )

                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response.data['user'], {
                    'id': user.id,
                    'username': 'varshini',
                    'email': 'varshini@gmail.com',
                    'role': 'student',
                })

    def test_invalid_login_returns_unauthorized_not_server_error(self):
        User.objects.create_user(
            username='invalid-login-user',
            email='invalid-login@example.com',
            password='StrongPass123',
            role='student',
        )

        response = self.client.post(
            reverse('login'),
            {'username': 'invalid-login-user', 'password': 'wrong-password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_invalid_registration_returns_bad_request_not_server_error(self):
        response = self.client.post(
            reverse('register'),
            {
                'username': 'mismatch-user',
                'email': 'mismatch@example.com',
                'password': 'StrongPass123',
                'confirmPassword': 'DifferentPass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_registration_accepts_camel_case_confirmation(self):
        response = self.client.post(
            reverse('register'),
            {
                'username': 'camel-case-user',
                'email': 'camel@example.com',
                'password': 'StrongPass123',
                'confirmPassword': 'StrongPass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='camel-case-user').exists())
