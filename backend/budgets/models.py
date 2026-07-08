from django.db import models

class Budget(models.Model):
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=20)

    def __str__(self):
        return self.category


class SavingsGoal(models.Model):
    goal_name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.goal_name
