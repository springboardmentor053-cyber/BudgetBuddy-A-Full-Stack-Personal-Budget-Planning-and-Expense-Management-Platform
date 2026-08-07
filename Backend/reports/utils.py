from datetime import datetime, date
import calendar
from django.utils import timezone


def get_date_range(request):
    """
    Parses request query params to extract start_date and end_date.
    Supports month, year, period (e.g., '10_2026'), and filter_type parameters.
    """
    filter_type = request.query_params.get('filter_type')
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    period = request.query_params.get('period')
    month_param = request.query_params.get('month')
    year_param = request.query_params.get('year')

    today = timezone.now().date()

    # Handle period param formatted as "10_2026" or "year_2026"
    if period:
        if period.startswith("year_"):
            try:
                year = int(period.split("_")[1])
                return date(year, 1, 1), date(year, 12, 31)
            except ValueError:
                pass
        elif "_" in period:
            try:
                m, y = map(int, period.split("_"))
                _, last_day = calendar.monthrange(y, m)
                return date(y, m, 1), date(y, m, last_day)
            except ValueError:
                pass

    # Handle individual month and year params
    if month_param or year_param:
        try:
            year = int(year_param) if year_param else today.year
            if month_param and month_param != 'ALL':
                month = int(month_param)
                _, last_day = calendar.monthrange(year, month)
                return date(year, month, 1), date(year, month, last_day)
            else:
                return date(year, 1, 1), date(year, 12, 31)
        except ValueError:
            pass

    # Handle presets
    if filter_type == 'current_month':
        _, last_day = calendar.monthrange(today.year, today.month)
        return today.replace(day=1), date(today.year, today.month, last_day)
    elif filter_type == 'previous_month':
        first_of_this_month = today.replace(day=1)
        last_month_end = first_of_this_month - timezone.timedelta(days=1)
        return last_month_end.replace(day=1), last_month_end
    elif start_date_str and end_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            return start_date, end_date
        except ValueError:
            pass

    # Default to current month full range
    _, last_day = calendar.monthrange(today.year, today.month)
    return today.replace(day=1), date(today.year, today.month, last_day)
