from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


@override_settings(GEMINI_API_KEY='test-key')
class AIChatPortalViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='ai-user', email='ai@example.com', password='Password123!'
        )
        self.client.force_authenticate(self.user)

    def test_generates_advice_with_chats_api_and_800_max_tokens(self):
        mock_response = MagicMock(text='- Keep your food budget under review.\n- Save 20% consistently.')
        mock_chat = MagicMock()
        mock_chat.send_message.return_value = mock_response

        with patch('users.ai_views.genai.Client') as client_class:
            client_class.return_value.chats.create.return_value = mock_chat
            result = self.client.post('/api/ai-chat/', {'message': 'How can I save money?'}, format='json')

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.data['reply'], mock_response.text)

        # Validate client.chats.create call
        chats_create_kwargs = client_class.return_value.chats.create.call_args.kwargs
        self.assertEqual(chats_create_kwargs['model'], 'gemini-3.6-flash')
        config = chats_create_kwargs['config']
        self.assertEqual(config.max_output_tokens, 800)
        self.assertEqual(config.temperature, 0.7)
        self.assertIn('Has recorded financial data: False', config.system_instruction)
        self.assertIn('50/30/20', config.system_instruction)

        # Validate chat.send_message call
        mock_chat.send_message.assert_called_once_with('How can I save money?')

    def test_rejects_missing_message(self):
        result = self.client.post('/api/ai-chat/', {'message': '  '}, format='json')
        self.assertEqual(result.status_code, status.HTTP_400_BAD_REQUEST)
