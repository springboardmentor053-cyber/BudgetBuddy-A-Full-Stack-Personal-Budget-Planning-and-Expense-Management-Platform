from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(
                choices=[
                    ('BUDGET_ALERT', 'Budget Alert'),
                    ('SAVINGS_GOAL', 'Savings Goal'),
                    ('TRANSACTION', 'Transaction Activity'),
                    ('GENERAL', 'General System'),
                ],
                default='GENERAL',
                max_length=50,
            ),
        ),
    ]
