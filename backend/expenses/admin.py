

# Register your models here.
from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    # This automatically shows whatever fields exist on your model without crashing
    list_display = [field.name for field in Expense._meta.fields]