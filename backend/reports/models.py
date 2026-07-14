from django.db import models

# Create your models here.
class Notification(models.Model):
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Report(models.Model):
    generated_at = models.DateTimeField(auto_now_add=True)
    report_type = models.CharField(max_length=50)
