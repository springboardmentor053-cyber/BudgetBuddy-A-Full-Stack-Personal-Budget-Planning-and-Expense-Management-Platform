from django.http import HttpResponse

def home(request):
    return HttpResponse("BudgetBuddy Backend is Running Successfully 🚀")