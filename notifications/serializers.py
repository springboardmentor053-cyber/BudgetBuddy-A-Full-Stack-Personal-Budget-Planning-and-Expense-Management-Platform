from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 
            'priority', 'is_read', 'created_at', 'user'
        ]
        read_only_fields = ['id', 'is_read', 'created_at', 'user']
