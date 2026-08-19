import io
from datetime import datetime
from calendar import monthrange

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum
from django.core.mail import EmailMessage
from django.http import HttpResponse

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from income.models import Income
from expenses.models import Expense
from budgets.models import Budget
from notifications.models import Notification

try:
    from savings.models import SavingsGoal
except ImportError:
    SavingsGoal = None


# Helper function for Date Range Filtering (Task 6)
def get_date_range(request):
    filter_type = request.query_params.get('filter_type')
    start_date_param = request.query_params.get('start_date')
    end_date_param = request.query_params.get('end_date')

    now = datetime.now()

    if filter_type == 'previous_month':
        year = now.year if now.month > 1 else now.year - 1
        month = now.month - 1 if now.month > 1 else 12
        _, last_day = monthrange(year, month)
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month, last_day, 23, 59, 59)
    elif filter_type == 'custom' and start_date_param and end_date_param:
        start_date = datetime.strptime(start_date_param, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_param, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
    else:  # Default to current_month
        _, last_day = monthrange(now.year, now.month)
        start_date = datetime(now.year, now.month, 1)
        end_date = datetime(now.year, now.month, last_day, 23, 59, 59)

    return start_date, end_date


# Task 2: Monthly Financial Report API
class MonthlyFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        month = int(request.query_params.get('month', datetime.now().month))
        year = int(request.query_params.get('year', datetime.now().year))

        total_income = float(Income.objects.filter(user=user, income_date__month=month, income_date__year=year).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        total_expense = float(Expense.objects.filter(user=user, expense_date__month=month, expense_date__year=year).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        current_balance = total_income - total_expense

        total_savings = 0.0
        if SavingsGoal:
            total_savings = float(SavingsGoal.objects.filter(user=user).aggregate(Sum('saved_amount'))['saved_amount__sum'] or 0.0)

        total_budget = float(Budget.objects.filter(user=user, month=month, year=year).aggregate(Sum('budget_amount'))['budget_amount__sum'] or 0.0)
        remaining_budget = total_budget - total_expense

        return Response({
            "month": month,
            "year": year,
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "remaining_budget": remaining_budget
        }, status=status.HTTP_200_OK)


# Task 3: Expense Report API
class ExpenseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date, end_date = get_date_range(request)
        expenses = Expense.objects.filter(user=request.user, expense_date__range=[start_date, end_date])

        data = [
            {
                "expense_title": exp.title,
                "category": exp.category,
                "amount": float(exp.amount),
                "date": exp.expense_date.strftime('%Y-%m-%d'),
                "description": getattr(exp, 'description', '')
            }
            for exp in expenses
        ]
        return Response(data, status=status.HTTP_200_OK)


# Task 4: Savings Report API
class SavingsReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not SavingsGoal:
            return Response([], status=status.HTTP_200_OK)

        savings = SavingsGoal.objects.filter(user=request.user)
        report_data = []

        for item in savings:
            target = float(item.target_amount or 0.0)
            saved = float(item.saved_amount or 0.0)
            remaining = target - saved
            progress = round((saved / target) * 100, 2) if target > 0 else 0.0
            
            if progress >= 100:
                calc_status = "Completed"
            elif progress > 0:
                calc_status = "In Progress"
            else:
                calc_status = "Not Started"

            report_data.append({
                "goal_name": item.target_name,
                "target_amount": target,
                "saved_amount": saved,
                "remaining_amount": remaining,
                "progress_percentage": progress,
                "status": calc_status
            })

        return Response(report_data, status=status.HTTP_200_OK)


# Task 5: Financial Summary Report API
class ComprehensiveSummaryReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date, end_date = get_date_range(request)

        # Summaries
        inc_total = float(Income.objects.filter(user=user, income_date__range=[start_date, end_date]).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        exp_total = float(Expense.objects.filter(user=user, expense_date__range=[start_date, end_date]).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        bal = inc_total - exp_total

        bud_total = float(Budget.objects.filter(user=user).aggregate(Sum('budget_amount'))['budget_amount__sum'] or 0.0)
        
        sav_total = 0.0
        if SavingsGoal:
            sav_total = float(SavingsGoal.objects.filter(user=user).aggregate(Sum('saved_amount'))['saved_amount__sum'] or 0.0)

        latest_notifs = list(Notification.objects.filter(user=user).order_by('-created_at')[:5].values('title', 'message'))

        return Response({
            "financial_summary": {
                "total_income": inc_total,
                "total_expense": exp_total,
                "current_balance": bal
            },
            "expense_summary": {"total_expense": exp_total},
            "income_summary": {"total_income": inc_total},
            "budget_summary": {"total_budget": bud_total, "remaining_budget": bud_total - exp_total},
            "savings_summary": {"total_savings": sav_total},
            "latest_notifications": latest_notifs
        }, status=status.HTTP_200_OK)


# Task 7: PDF Report Generation Helper
def generate_pdf_bytes(user, start_date, end_date):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Header
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor('#1E293B'))
    elements.append(Paragraph(f"Financial Report - {user.username}", title_style))
    elements.append(Paragraph(f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}", styles['Normal']))
    elements.append(Spacer(1, 15))

    # Calculations
    inc_total = float(Income.objects.filter(user=user, income_date__range=[start_date, end_date]).aggregate(Sum('amount'))['amount__sum'] or 0.0)
    exp_total = float(Expense.objects.filter(user=user, expense_date__range=[start_date, end_date]).aggregate(Sum('amount'))['amount__sum'] or 0.0)
    bal = inc_total - exp_total

    # Summary Table
    summary_data = [
        ['Metric', 'Amount (INR)'],
        ['Total Income', f"Rs. {inc_total}"],
        ['Total Expense', f"Rs. {exp_total}"],
        ['Net Balance', f"Rs. {bal}"]
    ]
    t = Table(summary_data, colWidths=[200, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Detailed Expenses
    elements.append(Paragraph("<b>Recent Expenses Breakdown</b>", styles['Heading2']))
    elements.append(Spacer(1, 10))
    expenses = Expense.objects.filter(user=user, expense_date__range=[start_date, end_date])
    
    exp_table_data = [['Title', 'Category', 'Amount (INR)', 'Date']]
    for e in expenses:
        exp_table_data.append([e.title, e.category, f"Rs. {e.amount}", e.expense_date.strftime('%Y-%m-%d')])

    if len(exp_table_data) > 1:
        exp_table = Table(exp_table_data, colWidths=[120, 100, 100, 100])
        exp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))
        elements.append(exp_table)
    else:
        elements.append(Paragraph("No expenses recorded for this period.", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


# PDF Export API
class ExportPDFReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date, end_date = get_date_range(request)
        pdf_bytes = generate_pdf_bytes(request.user, start_date, end_date)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Financial_Report_{request.user.username}.pdf"'
        return response


# PDF Email Notification API
class EmailPDFReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.email:
            return Response({"error": "User does not have an email address associated with their account."}, status=status.HTTP_400_BAD_REQUEST)

        start_date, end_date = get_date_range(request)
        pdf_bytes = generate_pdf_bytes(user, start_date, end_date)

        # Create Email Notification with PDF Attachment
        email = EmailMessage(
            subject="Your Financial Summary Report (PDF)",
            body=f"Hello {user.username},\n\nPlease find attached your requested PDF Financial Report for the period {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}.\n\nBest regards,\nSmart Finance Team",
            from_email=None,
            to=[user.email]
        )
        email.attach(f"Financial_Report_{user.username}.pdf", pdf_bytes, 'application/pdf')
        email.send(fail_silently=False)

        return Response({"message": f"PDF report emailed successfully to {user.email}"}, status=status.HTTP_200_OK)