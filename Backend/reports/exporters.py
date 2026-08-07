import csv
import io
import pandas as pd
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors


def export_expenses_csv(queryset):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="expense_report.csv"'

    writer = csv.writer(response)
    writer.writerow(['Expense Title', 'Category',
                    'Amount', 'Date', 'Description'])

    for expense in queryset:
        writer.writerow([
            expense.title,
            expense.category,
            expense.amount,
            expense.expense_date,
            expense.description or ''
        ])

    return response


def export_expenses_excel(queryset):
    data = [
        {
            'Expense Title': expense.title,
            'Category': expense.category,
            'Amount': float(expense.amount),
            'Date': str(expense.expense_date),
            'Description': expense.description or ''
        }
        for expense in queryset
    ]

    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Expenses')

    output.seek(0)
    response = HttpResponse(
        output.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="expense_report.xlsx"'
    return response


def export_financial_pdf(summary_data, expense_list):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    story = [
        Paragraph("Financial Summary Report", styles['Heading1']),
        Spacer(1, 12)
    ]

    # Key Summary Metrics (Using INR for standard Helvetica compatibility)
    summary_table_data = [
        ["Metric", "Amount"],
        ["Total Income", f"INR {summary_data['total_income']:.2f}"],
        ["Total Expense", f"INR {summary_data['total_expense']:.2f}"],
        ["Net Balance", f"INR {summary_data['net_balance']:.2f}"],
        ["Total Savings", f"INR {summary_data['total_savings']:.2f}"],
    ]

    summary_table = Table(summary_table_data, colWidths=[200, 200])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    story.extend([summary_table, Spacer(1, 20), Paragraph(
        "Expense Details", styles['Heading2']), Spacer(1, 10)])

    expense_table_data = [["Title", "Category", "Amount", "Date"]]
    for item in expense_list:
        expense_table_data.append([
            item['expense_title'],
            item['category'],
            f"INR {item['amount']:.2f}",
            str(item['date'])
        ])

    expense_table = Table(expense_table_data, colWidths=[150, 120, 100, 100])
    expense_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
    ]))

    story.append(expense_table)
    doc.build(story)
    buffer.seek(0)

    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="financial_report.pdf"'
    return response
