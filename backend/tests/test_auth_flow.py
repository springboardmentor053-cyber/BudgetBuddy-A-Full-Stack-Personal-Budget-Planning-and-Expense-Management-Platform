from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthFlowTests(APITestCase):
    def test_user_can_register_and_login(self):
        register_url = reverse('register')
        login_url = reverse('login')
        profile_url = reverse('profile')

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
