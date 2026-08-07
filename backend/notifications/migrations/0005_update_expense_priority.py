from django.db import migrations


def set_expense_priority_low(apps, schema_editor):
    Notification = apps.get_model('notifications', 'Notification')
    Notification.objects.filter(notification_type='EXPENSE_CREATED').update(priority='LOW')


def revert_expense_priority(apps, schema_editor):
    Notification = apps.get_model('notifications', 'Notification')
    # Revert only if you want to restore previous medium state; default back to 'MEDIUM'
    Notification.objects.filter(notification_type='EXPENSE_CREATED').update(priority='MEDIUM')


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0004_alter_notification_priority'),
    ]

    operations = [
        migrations.RunPython(set_expense_priority_low, revert_expense_priority),
    ]
