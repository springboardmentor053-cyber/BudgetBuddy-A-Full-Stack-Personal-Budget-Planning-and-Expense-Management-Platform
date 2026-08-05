import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from savings.models import Notification

def cleanup_duplicate_notifications():
    print("Starting database duplicate notifications cleanup...")
    all_notifs = Notification.objects.all().order_by('id')
    seen = set()
    deleted_count = 0

    for notif in all_notifs:
        # Key tuple for deduplication: user_id, notification_type, title, message
        key = (notif.user_id, notif.notification_type, notif.title.strip(), notif.message.strip())
        if key in seen:
            notif.delete()
            deleted_count += 1
        else:
            seen.add(key)

    print(f"Cleanup finished: Removed {deleted_count} duplicate notification entries from database.")

if __name__ == '__main__':
    cleanup_duplicate_notifications()
