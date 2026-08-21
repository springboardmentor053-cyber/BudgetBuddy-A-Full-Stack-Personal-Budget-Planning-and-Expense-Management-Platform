import json
import datetime
import logging
import urllib.request
import urllib.error
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from decouple import config

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget

logger = logging.getLogger(__name__)

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        message = request.data.get('message', '').strip()

        if not message:
            return Response(
                {"response": "Please enter a message."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Fetch financial data belonging to the user
        try:
            # Total Income
            total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
            
            # Total Expense
            total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
            
            # Current Balance
            current_balance = total_income - total_expense
            
            # Expense Categories (all time or breakdown)
            categories_qs = Expense.objects.filter(user=user).values('category').annotate(total=Sum('amount'))
            expense_categories = {c['category'].title(): float(c['total']) for c in categories_qs}
            
            # Recent Transactions (latest 10 combined)
            incomes_q = Income.objects.filter(user=user).order_by('-income_date')[:10]
            expenses_q = Expense.objects.filter(user=user).order_by('-date')[:10]
            
            transactions = []
            for inc in incomes_q:
                transactions.append({
                    'title': inc.title,
                    'source': inc.source,
                    'amount': float(inc.amount),
                    'date': inc.income_date.isoformat(),
                    'type': 'income'
                })
            for exp in expenses_q:
                transactions.append({
                    'category': exp.category,
                    'description': exp.description,
                    'amount': float(exp.amount),
                    'date': exp.date.isoformat(),
                    'type': 'expense'
                })
            transactions.sort(key=lambda x: x['date'], reverse=True)
            recent_transactions = transactions[:10]

            # Current Month date range calculations
            today = datetime.date.today()
            month_str = today.strftime("%B")  # e.g., "August"
            start_of_month = datetime.date(today.year, today.month, 1)
            if today.month == 12:
                end_of_month = datetime.date(today.year + 1, 1, 1)
            else:
                end_of_month = datetime.date(today.year, today.month + 1, 1)

            # Budgets for the current month
            budgets_qs = Budget.objects.filter(user=user, month=month_str)
            total_budget = budgets_qs.aggregate(total=Sum('limit_amount'))['total'] or 0

            # Remaining budget logic
            budgeted_categories = list(budgets_qs.values_list('category', flat=True).distinct())
            budgeted_categories_upper = [c.upper() for c in budgeted_categories]
            total_spent_on_budgeted = Expense.objects.filter(
                user=user,
                category__in=budgeted_categories_upper,
                date__gte=start_of_month,
                date__lt=end_of_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            remaining_budget = total_budget - total_spent_on_budgeted

            # Overspent Categories
            overspent_categories = []
            for budget in budgets_qs:
                category_upper = budget.category.upper()
                spent = Expense.objects.filter(
                    user=user,
                    category=category_upper,
                    date__gte=start_of_month,
                    date__lt=end_of_month
                ).aggregate(total=Sum('amount'))['total'] or 0
                if spent > budget.limit_amount:
                    overspent_categories.append({
                        'category': budget.category.title(),
                        'limit': float(budget.limit_amount),
                        'spent': float(spent),
                        'over_by': float(spent - budget.limit_amount)
                    })

        except Exception as e:
            logger.error(f"Error calculating financial context: {str(e)}")
            return Response(
                {"response": "Sorry, I'm having trouble retrieving your financial context right now. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 2. Check Groq API Key configuration
        groq_api_key = config('GROQ_API_KEY', default='').strip()
        if not groq_api_key or groq_api_key == 'YOUR_GROQ_API_KEY_HERE':
            logger.error("GROQ_API_KEY environment variable is not configured or has default value.")
            return Response(
                {"response": "Sorry, I'm having trouble connecting right now. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # 3. Format the prompts
        category_breakdown_str = "\n".join([f"- {cat}: ${amt:.2f}" for cat, amt in expense_categories.items()]) if expense_categories else "- No expenses recorded."
        
        if overspent_categories:
            overspent_str = "\n".join([f"- {item['category']}: Spent ${item['spent']:.2f} (Limit: ${item['limit']:.2f}, Over by ${item['over_by']:.2f})" for item in overspent_categories])
        else:
            overspent_str = "- None. All budgeted categories are within their limits."

        transactions_list = []
        for t in recent_transactions:
            if t['type'] == 'income':
                transactions_list.append(f"- [{t['date']}] Income: {t['title']} ({t['source']}) +${t['amount']:.2f}")
            else:
                transactions_list.append(f"- [{t['date']}] Expense: {t['category']} ({t['description'] or 'No description'}) -${t['amount']:.2f}")
        transactions_str = "\n".join(transactions_list) if transactions_list else "- No recent transactions."

        system_prompt = f"""You are the BudgetBuddy AI Financial Assistant. You help users manage their finances by answering questions based on their personal budget data.
Your responses should be friendly, clear, concise, and provide useful financial guidance.
Always refer to the user's specific numerical values below whenever they ask about their income, balance, expenses, categories, or budgets.

Here is the user's current financial context:
- Total Income: ${total_income:.2f}
- Total Expenses: ${total_expense:.2f}
- Current Balance: ${current_balance:.2f}
- Current Monthly Budget Limit: ${total_budget:.2f}
- Current Monthly Budget Spent: ${total_spent_on_budgeted:.2f}
- Current Monthly Budget Remaining: ${remaining_budget:.2f}

Category-wise spending (all time):
{category_breakdown_str}

Overspent Categories (current month):
{overspent_str}

Recent Transactions (latest 10):
{transactions_str}

Please answer the user's question accurately using the data above. If the question is generic (e.g. "How can I reduce my expenses?"), reference their specific spending categories to make your advice tailored and highly relevant.

Always end your response with this EXACT disclaimer on a new line:
*Disclaimer: BudgetBuddy provides general financial guidance and is not a professional financial advisor.*"""

        # 4. Make request to Groq API
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        payload = {
            "model": "groq/compound",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "temperature": 0.3,
            "max_tokens": 1024
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                res_body = response.read().decode('utf-8')
                res_data = json.loads(res_body)
                ai_response = res_data['choices'][0]['message']['content'].strip()
                return Response({"response": ai_response}, status=status.HTTP_200_OK)

        except urllib.error.HTTPError as e:
            logger.error(f"Groq API HTTP Error: status_code={e.code}, reason={e.reason}")
            
            if e.code == 401:
                friendly_msg = "Sorry, I'm having trouble authenticating with the AI service. Please try again later."
            elif e.code == 429:
                friendly_msg = "Sorry, the AI service is currently busy. Please wait a moment and try again."
            else:
                friendly_msg = "Sorry, I'm having trouble connecting right now. Please try again."
                
            return Response({"response": friendly_msg}, status=status.HTTP_502_BAD_GATEWAY)

        except urllib.error.URLError as e:
            logger.error(f"Groq API Network Connection Error: {e.reason}")
            return Response(
                {"response": "Sorry, I'm having trouble connecting right now. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY
            )

        except Exception as e:
            logger.error(f"Unexpected error when querying Groq API: {str(e)}")
            return Response(
                {"response": "Sorry, I'm having trouble connecting right now. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
