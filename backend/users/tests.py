from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class UserRegistrationAPITests(APITestCase):
    """
    Test suite for User Registration API.
    """

    def setUp(self):
        self.register_url = reverse("register")
        self.valid_payload = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "StrongPassword123!",
        }

    def test_successful_user_registration(self):
        """
        Ensure a new user can register successfully with valid credentials.
        """
        response = self.client.post(self.register_url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "User registered successfully")
        self.assertTrue(User.objects.filter(username="testuser").exists())

        user = User.objects.get(username="testuser")
        self.assertEqual(user.email, "testuser@example.com")
        self.assertTrue(user.check_password("StrongPassword123!"))

    def test_registration_missing_fields(self):
        """
        Ensure registration fails if any required field (username, email, password) is missing.
        """
        # Missing password
        payload = {
            "username": "incompleteuser",
            "email": "incomplete@example.com",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "All fields are required.")

        # Missing username
        payload = {
            "email": "incomplete@example.com",
            "password": "SomePassword123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_duplicate_username(self):
        """
        Ensure registration fails when attempting to create a user with an existing username.
        """
        User.objects.create_user(
            username="existinguser",
            email="existing@example.com",
            password="Password123!",
        )

        payload = {
            "username": "existinguser",
            "email": "another@example.com",
            "password": "NewPassword123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Username already exists")


class UserAuthenticationAPITests(APITestCase):
    """
    Test suite for JWT Authentication, Token Refresh, and Protected Endpoints.
    """

    def setUp(self):
        self.token_url = reverse("token_obtain_pair")
        self.token_refresh_url = reverse("token_refresh")
        self.protected_url = reverse("protected")
        self.me_url = reverse("current-user")

        self.username = "authuser"
        self.password = "SecurePass123!"
        self.email = "authuser@example.com"
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
        )

    def test_jwt_token_obtain_success(self):
        """
        Ensure valid credentials return access and refresh JWT tokens.
        """
        payload = {
            "username": self.username,
            "password": self.password,
        }
        response = self.client.post(self.token_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertTrue(len(response.data["access"]) > 20)

    def test_jwt_token_obtain_invalid_credentials(self):
        """
        Ensure invalid password returns 401 Unauthorized.
        """
        payload = {
            "username": self.username,
            "password": "WrongPassword!",
        }
        response = self.client.post(self.token_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_token_refresh(self):
        """
        Ensure a valid refresh token can be exchanged for a new access token.
        """
        token_response = self.client.post(
            self.token_url,
            {"username": self.username, "password": self.password},
            format="json",
        )
        refresh_token = token_response.data["refresh"]

        refresh_response = self.client.post(
            self.token_refresh_url,
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

    def test_protected_view_with_valid_jwt(self):
        """
        Ensure protected endpoint can be accessed with valid Bearer token.
        """
        token_response = self.client.post(
            self.token_url,
            {"username": self.username, "password": self.password},
            format="json",
        )
        access_token = token_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "You are authenticated")

    def test_protected_view_without_token_unauthorized(self):
        """
        Ensure accessing protected endpoint without authentication returns 401.
        """
        self.client.credentials()  # clear credentials
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_profile_endpoint(self):
        """
        Ensure /api/users/me/ returns authenticated user's profile details.
        """
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.username)
        self.assertEqual(response.data["email"], self.email)
        self.assertEqual(response.data["id"], self.user.id)
