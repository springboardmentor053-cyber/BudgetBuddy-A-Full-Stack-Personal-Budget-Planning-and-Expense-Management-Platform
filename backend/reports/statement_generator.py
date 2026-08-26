"""ReportLab renderer for authenticated BudgetBuddy financial statements."""

from collections import defaultdict
from datetime import datetime
from decimal import Decimal
from io import BytesIO

from django.db.models import Sum
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from income.models import Income
from users.models import Expense


NAVY = colors.HexColor('#0F172A')
SLATE = colors.HexColor('#475569')
PALE = colors.HexColor('#F8FAFC')
GREEN = colors.HexColor('#15803D')
RED = colors.HexColor('#BE123C')
LINE = colors.HexColor('#CBD5E1')


class NumberedCanvas(canvas.Canvas):
    """Canvas that writes a reliable Page X of Y footer on every page."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_footer(page_count)
            super().showPage()
        super().save()

    def _draw_footer(self, page_count):
        self.saveState()
        self.setStrokeColor(LINE)
        self.line(14 * mm, 15 * mm, A4[0] - 14 * mm, 15 * mm)
        self.setFont('Helvetica', 7.5)
        self.setFillColor(SLATE)
        self.drawString(14 * mm, 10 * mm, 'Confidential financial information — generated automatically by BudgetBuddy.')
        self.drawRightString(A4[0] - 14 * mm, 10 * mm, f'Page {self._pageNumber} of {page_count}')
        self.restoreState()


class StatementDocument(SimpleDocTemplate):
    """Simple document template with a footer-safe content area."""


def _currency_for(user):
    currency = getattr(getattr(user, 'profile', None), 'currency', 'INR') or 'INR'
    currency = currency.upper()
    return ('₹' if currency == 'INR' else '$' if currency == 'USD' else f'{currency} '), currency


def _amount(value, symbol):
    return f'{symbol}{Decimal(value or 0):,.2f}'


def _paragraph(text, style):
    return Paragraph(str(text), style)


def generate_statement(user, start_date, end_date):
    """Return a PDF byte buffer for a user's selected statement period."""
    symbol, currency = _currency_for(user)
    income_qs = Income.objects.filter(user=user)
    expense_qs = Expense.objects.filter(user=user)

    opening_income = income_qs.filter(income_date__lt=start_date).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    opening_expense = expense_qs.filter(expense_date__lt=start_date).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    opening_balance = opening_income - opening_expense
    incomes = income_qs.filter(income_date__range=(start_date, end_date))
    expenses = expense_qs.filter(expense_date__range=(start_date, end_date))
    total_income = incomes.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_expense = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0')
    net_balance = opening_balance + total_income - total_expense
    savings_rate = ((total_income - total_expense) / total_income * 100) if total_income else Decimal('0')

    transactions = []
    for income in incomes:
        transactions.append({
            'date': income.income_date, 'title': income.title or 'Income',
            'description': income.description or '', 'category': income.category or 'Income',
            'type': 'Income', 'amount': income.amount, 'id': income.id,
        })
    for expense in expenses:
        transactions.append({
            'date': expense.expense_date, 'title': expense.title or 'Expense',
            'description': expense.description or '', 'category': expense.category or 'Uncategorized',
            'type': 'Expense', 'amount': expense.amount, 'id': expense.id,
        })
    transactions.sort(key=lambda item: (item['date'], item['type'] != 'Income', item['id']))

    expense_categories = defaultdict(Decimal)
    balance = opening_balance
    for transaction in transactions:
        if transaction['type'] == 'Income':
            balance += transaction['amount']
        else:
            balance -= transaction['amount']
            expense_categories[transaction['category']] += transaction['amount']
        transaction['balance'] = balance

    buffer = BytesIO()
    doc = StatementDocument(
        buffer, pagesize=A4, leftMargin=14 * mm, rightMargin=14 * mm,
        topMargin=14 * mm, bottomMargin=22 * mm,
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Small', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10, textColor=SLATE))
    styles.add(ParagraphStyle(name='Cell', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9, textColor=NAVY))
    styles.add(ParagraphStyle(name='CellRight', parent=styles['Cell'], alignment=TA_RIGHT))
    styles.add(ParagraphStyle(name='MetricLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=9, textColor=SLATE))
    styles.add(ParagraphStyle(name='MetricValue', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=NAVY))
    story = []

    period = f'{start_date.strftime("%d %b %Y")} – {end_date.strftime("%d %b %Y")}'
    generated = timezone.localtime(timezone.now()).strftime('%d %b %Y, %I:%M %p %Z')
    header = Table([[
        _paragraph('<font color="#FFFFFF" size="18"><b>BudgetBuddy Statement</b></font><br/><font color="#CBD5E1" size="8">PERSONAL FINANCE ACCOUNT STATEMENT</font>', styles['Normal']),
        _paragraph(f'<para alignment="right"><font color="#FFFFFF" size="8"><b>Generated</b><br/>{generated}<br/><br/><b>Statement period</b><br/>{period}</font></para>', styles['Normal']),
    ]], colWidths=[112 * mm, 70 * mm])
    header.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), NAVY), ('BOX', (0, 0), (-1, -1), 0, NAVY), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 8 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 8 * mm), ('TOPPADDING', (0, 0), (-1, -1), 6 * mm), ('BOTTOMPADDING', (0, 0), (-1, -1), 6 * mm)]))
    story.extend([header, Spacer(1, 5 * mm)])

    display_name = user.get_full_name().strip() or user.username
    account = Table([[
        _paragraph('<b>ACCOUNT HOLDER</b><br/>' + display_name, styles['Small']),
        _paragraph('<b>EMAIL</b><br/>' + (user.email or 'Not provided'), styles['Small']),
        _paragraph('<b>STATEMENT PERIOD</b><br/>' + period, styles['Small']),
        _paragraph('<b>CURRENCY</b><br/>' + currency, styles['Small']),
    ]], colWidths=[45 * mm, 55 * mm, 55 * mm, 27 * mm])
    account.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), PALE), ('BOX', (0, 0), (-1, -1), .5, LINE), ('INNERGRID', (0, 0), (-1, -1), .25, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('PADDING', (0, 0), (-1, -1), 3 * mm)]))
    story.extend([account, Spacer(1, 5 * mm)])

    metrics = [
        ('OPENING / NET BALANCE', f'{_amount(opening_balance, symbol)} / {_amount(net_balance, symbol)}', NAVY),
        ('TOTAL INFLOWS', _amount(total_income, symbol), GREEN),
        ('TOTAL OUTFLOWS', _amount(total_expense, symbol), RED),
        ('NET SAVINGS RATE', f'{savings_rate:.1f}%', GREEN if savings_rate >= 0 else RED),
    ]
    metric_cells = [[_paragraph(label, styles['MetricLabel']), _paragraph(f'<font color="{color.hexval()}">{value}</font>', styles['MetricValue'])] for label, value, color in metrics]
    metric_table = Table([metric_cells], colWidths=[45.5 * mm] * 4)
    metric_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.white), ('BOX', (0, 0), (-1, -1), .5, LINE), ('INNERGRID', (0, 0), (-1, -1), .5, LINE), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (0, 0), (-1, -1), 3 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 3 * mm), ('TOPPADDING', (0, 0), (-1, -1), 3 * mm), ('BOTTOMPADDING', (0, 0), (-1, -1), 3 * mm)]))
    story.extend([metric_table, Spacer(1, 6 * mm), _paragraph('<b>ITEMIZED TRANSACTION LEDGER</b>', styles['Heading3']), Spacer(1, 2 * mm)])

    ledger_rows = [[_paragraph(label, styles['Cell']) for label in ('DATE', 'TRANSACTION TITLE / DESCRIPTION', 'CATEGORY', 'TYPE', 'AMOUNT', 'RUNNING BALANCE')]]
    for item in transactions:
        description = f'<br/><font color="#64748B">{item["description"]}</font>' if item['description'] else ''
        color = GREEN if item['type'] == 'Income' else RED
        signed = '+' if item['type'] == 'Income' else '-'
        ledger_rows.append([
            _paragraph(item['date'].strftime('%d %b %Y'), styles['Cell']),
            _paragraph(f'<b>{item["title"]}</b>{description}', styles['Cell']),
            _paragraph(item['category'].replace('_', ' ').title(), styles['Cell']),
            _paragraph(f'<font color="{color.hexval()}"><b>{item["type"]}</b></font>', styles['Cell']),
            _paragraph(f'<font color="{color.hexval()}"><b>{signed}{_amount(item["amount"], symbol)}</b></font>', styles['CellRight']),
            _paragraph(_amount(item['balance'], symbol), styles['CellRight']),
        ])
    if not transactions:
        ledger_rows.append([_paragraph('No transactions were recorded for this period.', styles['Cell']), '', '', '', '', ''])

    ledger = Table(ledger_rows, colWidths=[23 * mm, 53 * mm, 27 * mm, 20 * mm, 31 * mm, 31 * mm], repeatRows=1)
    ledger_style = [('BACKGROUND', (0, 0), (-1, 0), NAVY), ('TEXTCOLOR', (0, 0), (-1, 0), colors.white), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('GRID', (0, 0), (-1, -1), .25, LINE), ('LEFTPADDING', (0, 0), (-1, -1), 2 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 2 * mm), ('TOPPADDING', (0, 0), (-1, -1), 2 * mm), ('BOTTOMPADDING', (0, 0), (-1, -1), 2 * mm)]
    ledger_style.extend(('BACKGROUND', (0, row), (-1, row), PALE if row % 2 else colors.white) for row in range(1, len(ledger_rows)))
    ledger.setStyle(TableStyle(ledger_style))
    story.extend([ledger, Spacer(1, 6 * mm), _paragraph('<b>EXPENSE CATEGORY BREAKDOWN</b>', styles['Heading3']), Spacer(1, 2 * mm)])

    category_rows = [[_paragraph('CATEGORY', styles['Cell']), _paragraph('TOTAL EXPENSES', styles['CellRight']), _paragraph('% OF OUTFLOWS', styles['CellRight'])]]
    for category, amount in sorted(expense_categories.items(), key=lambda pair: pair[1], reverse=True):
        percentage = (amount / total_expense * 100) if total_expense else Decimal('0')
        category_rows.append([_paragraph(category.replace('_', ' ').title(), styles['Cell']), _paragraph(_amount(amount, symbol), styles['CellRight']), _paragraph(f'{percentage:.1f}%', styles['CellRight'])])
    if not expense_categories:
        category_rows.append([_paragraph('No expenses were recorded for this period.', styles['Cell']), '', ''])
    categories = Table(category_rows, colWidths=[80 * mm, 51 * mm, 54 * mm], repeatRows=1)
    categories.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), NAVY), ('TEXTCOLOR', (0, 0), (-1, 0), colors.white), ('GRID', (0, 0), (-1, -1), .25, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 3 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 3 * mm), ('TOPPADDING', (0, 0), (-1, -1), 2 * mm), ('BOTTOMPADDING', (0, 0), (-1, -1), 2 * mm)] + [('BACKGROUND', (0, row), (-1, row), PALE if row % 2 else colors.white) for row in range(1, len(category_rows))]))
    story.append(categories)
    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer
