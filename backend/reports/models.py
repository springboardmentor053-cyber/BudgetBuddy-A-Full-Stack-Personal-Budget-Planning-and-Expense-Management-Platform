from django.db import models

class Notification(models.Model):
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message


class Report(models.Model):
    report_name = models.CharField(max_length=100)
    generated_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.report_name