from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


@override_settings(GROQ_API_KEY='test-key')
class AIChatPortalViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='ai-user', email='ai@example.com', password='Password123!'
        )
        self.client.force_authenticate(self.user)

    def test_generates_advice_with_live_financial_context(self):
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = 'Keep your food budget under review.'
        mock_client = MagicMock()
        mock_client.models.list.return_value.data = [MagicMock(id='llama-3.3-70b-versatile')]
        mock_client.chat.completions.create.return_value = mock_completion

        with patch('users.ai_views.Groq', return_value=mock_client):
            result = self.client.post('/api/ai-chat/', {'message': 'How can I save money?'}, format='json')

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.data['reply'], mock_completion.choices[0].message.content)

        completion_kwargs = mock_client.chat.completions.create.call_args.kwargs
        self.assertEqual(completion_kwargs['model'], 'llama-3.3-70b-versatile')
        self.assertEqual(completion_kwargs['temperature'], 0.1)
        self.assertEqual(completion_kwargs['max_tokens'], 600)
        self.assertIn('Has Logged Data: False', completion_kwargs['messages'][0]['content'])

    def test_rejects_missing_message(self):
        result = self.client.post('/api/ai-chat/', {'message': '  '}, format='json')
        self.assertEqual(result.status_code, status.HTTP_400_BAD_REQUEST)
