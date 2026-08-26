import { useCallback, useEffect, useRef, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import api from '../api/axios';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const emptySummary = {
  total_income: 0,
  total_expense: 0,
  current_balance: 0,
  total_budget: 0,
  remaining_budget: 0,
};

const toNumber = (value) => Number(value || 0);
const formatCurrency = (value) => toNumber(value).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getExpensesFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`;

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
};

const filenameFromDisposition = (contentDisposition, fallback) => {
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition || '');
  return match?.[1]?.replace(/['"]/g, '') || fallback;
};

const parseLocalDate = (value, endOfDay = false) => {
  const [year, month, day] = String(value || '').slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getActivePeriod = (filter, startDate, endDate) => {
  const currentDate = new Date();
  let targetMonth;
  let targetYear;
  let startDateObj;
  let endDateObj;

  if (filter === 'current_month') {
    targetMonth = currentDate.getMonth() + 1;
    targetYear = currentDate.getFullYear();
    startDateObj = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    endDateObj = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
  } else if (filter === 'previous_month') {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    targetMonth = previousMonth.getMonth() + 1;
    targetYear = previousMonth.getFullYear();
    startDateObj = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    endDateObj = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
  } else if (filter === 'custom') {
    startDateObj = parseLocalDate(startDate);
    endDateObj = parseLocalDate(endDate, true);
    if (!startDateObj || !endDateObj || startDateObj > endDateObj) return null;
  } else {
    return null;
  }

  return { targetMonth, targetYear, startDateObj, endDateObj };
};

const isTransactionInPeriod = (item, period) => {
  const itemDate = parseLocalDate(item?.expense_date || item?.income_date || item?.date);
  return Boolean(itemDate && itemDate >= period.startDateObj && itemDate <= period.endDateObj);
};

const isBudgetInPeriod = (budget, period) => {
  const month = Number(budget?.month);
  const year = Number(budget?.year);
  if (!month || !year) return false;

  if (period.targetMonth && period.targetYear) {
    return month === period.targetMonth && year === period.targetYear;
  }

  const budgetStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const budgetEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return budgetStart <= period.endDateObj && budgetEnd >= period.startDateObj;
};

export default function Reports() {
  const [filter, setFilter] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(emptySummary);
  const [expenses, setExpenses] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [exporting, setExporting] = useState('');
  const requestId = useRef(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    const activeRequestId = ++requestId.current;
    const activePeriod = getActivePeriod(filter, startDate, endDate);

    if (!activePeriod) {
      if (activeRequestId === requestId.current) {
        setSummary(emptySummary);
        setExpenses([]);
        setLoading(false);
      }
      return;
    }

    const timeframeByFilter = {
      current_month: 'this_month',
      custom: 'all',
    };

    try {
      const dashboardRequest = api.get('/api/auth/dashboard/', {
        params: filter === 'previous_month'
          ? { month: activePeriod.targetMonth, year: activePeriod.targetYear }
          : { timeframe: timeframeByFilter[filter] || 'this_month' },
      }).catch(() => ({ data: emptySummary }));

      const expensesRequest = api.get('/api/expenses/').catch(() => api.get('/api/expenses/tracking/'));
      const incomesRequest = api.get('/api/incomes/').catch(() => ({ data: [] }));
      const budgetsRequest = api.get('/api/budgets/').catch(() => ({ data: [] }));
      const goalsRequest = api.get('/api/savings/goals/progress/').catch(() => ({ data: { goals: [] } }));
      const [dashboardResponse, expensesResponse, incomesResponse, budgetsResponse, goalsResponse] = await Promise.all([
        dashboardRequest, expensesRequest, incomesRequest, budgetsRequest, goalsRequest,
      ]);

      const records = getExpensesFromResponse(expensesResponse?.data)
        .filter((expense) => isTransactionInPeriod(expense, activePeriod))
        .sort((a, b) => {
          const dateDifference = new Date(b?.expense_date || b?.date || b?.created_at || 0)
            - new Date(a?.expense_date || a?.date || a?.created_at || 0);
          return dateDifference || new Date(b?.created_at || 0) - new Date(a?.created_at || 0) || toNumber(b?.id) - toNumber(a?.id);
        });
      const periodIncomes = getExpensesFromResponse(incomesResponse?.data)
        .filter((income) => isTransactionInPeriod(income, activePeriod));
      const budgets = getExpensesFromResponse(budgetsResponse?.data);
      const activePeriodBudgets = budgets.filter((budget) => isBudgetInPeriod(budget, activePeriod));
      const totalIncome = periodIncomes.reduce((total, income) => total + toNumber(income?.amount), 0);
      const totalExpense = records.reduce((total, expense) => total + toNumber(expense?.amount), 0);
      const totalBudget = activePeriodBudgets.reduce((total, budget) => total + toNumber(budget?.budget_amount), 0);
      const remainingBudget = filter !== 'current_month' && activePeriodBudgets.length === 0
        ? 0
        : totalBudget - totalExpense;

      if (activeRequestId !== requestId.current) return;
      setExpenses(records);
      setSummary({
        ...emptySummary,
        // Retain dashboard data only for non-rendered compatibility fields.
        ...dashboardResponse?.data,
        total_income: totalIncome,
        total_expense: totalExpense,
        current_balance: totalIncome - totalExpense,
        total_budget: totalBudget,
        remaining_budget: remainingBudget,
      });
      setSavingsGoals(goalsResponse?.data?.goals || getExpensesFromResponse(goalsResponse?.data));
    } catch (error) {
      if (activeRequestId === requestId.current) {
        setError('Failed to load financial reports. Please try refreshing or check your connection.');
        setSummary(emptySummary);
        setExpenses([]);
        setSavingsGoals([]);
      }
    } finally {
      if (activeRequestId === requestId.current) setLoading(false);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    if (filter !== 'custom') {
      void fetchReports();
      return;
    }

    if (startDate && endDate) {
      void fetchReports();
      return;
    }

    setSummary(emptySummary);
    setExpenses([]);
  }, [filter, fetchReports]);

  const handleCustomSearch = (event) => {
    event.preventDefault();
    if (startDate && endDate) void fetchReports();
  };

  const exportParams = {
    filter,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  const handleCsvExport = async () => {
    setExporting('csv');
    const filename = `expense-report-${filter}.csv`;

    try {
      const response = await api.get('/api/reports/export/csv/', {
        params: exportParams,
        responseType: 'blob',
      });
      downloadBlob(response.data, filename);
    } catch (error) {
      const rows = expenses.map((expense) => [
        expense?.title || 'Untitled expense',
        expense?.category || 'Uncategorised',
        expense?.expense_date || expense?.date || '',
        toNumber(expense?.amount).toFixed(2),
      ]);
      const csv = [
        ['Title', 'Category', 'Date', 'Amount (INR)'],
        ...rows,
      ].map((row) => row.map(csvValue).join(',')).join('\r\n');
      downloadBlob(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }), filename);
    } finally {
      setExporting('');
    }
  };

  const handlePdfExport = async () => {
    setExporting('pdf');
    try {
      const response = await api.get('/api/reports/export/pdf/', {
        params: exportParams,
        responseType: 'blob',
      });
      downloadBlob(
        response.data,
        filenameFromDisposition(response.headers['content-disposition'], `BudgetBuddy_Statement_${filter}.pdf`),
      );
    } catch (error) {
      setError('Your statement could not be generated. Please try again.');
    } finally {
      setExporting('');
    }
  };

  const categoryData = Object.entries(expenses.reduce((totals, expense) => {
    const category = expense?.category || expense?.name || expense?.source || 'Uncategorized';
    totals[category] = (totals[category] || 0) + toNumber(expense?.amount);
    return totals;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const topCategory = categoryData[0];
  const monthlyTrendData = buildMonthlyTrendData(expenses);

  return (
    <div className="p-4 pt-20 space-y-6 sm:p-8 w-full max-w-7xl mx-auto text-slate-100">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time breakdown of your income, expenses, budget limits, and savings.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={handleCsvExport} disabled={exporting !== ''} className="bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-emerald-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true">↓</span>{exporting === 'csv' ? 'Preparing CSV...' : 'Export CSV'}
          </button>
          <button type="button" onClick={handlePdfExport} disabled={exporting !== ''} className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            <span aria-hidden="true">↓</span>{exporting === 'pdf' ? 'Generating PDF...' : 'Download Statement (PDF)'}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: 'current_month', label: 'Current Month' },
              { value: 'previous_month', label: 'Previous Month' },
              { value: 'custom', label: 'Custom Range' },
            ].map(({ value, label }) => (
              <button key={value} onClick={() => setFilter(value)} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${filter === value ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filter === 'custom' && (
        <form onSubmit={handleCustomSearch} className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <label className="flex items-center gap-2 text-xs text-slate-400">From:<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500" required /></label>
          <label className="flex items-center gap-2 text-xs text-slate-400">To:<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500" required /></label>
          <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition-colors">Apply Range</button>
        </form>
      )}

      {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      {loading ? <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-medium">Loading financial metrics...</div> : <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Income" value={summary?.total_income} color="text-emerald-400" />
          <MetricCard label="Total Expense" value={summary?.total_expense} color="text-rose-400" />
          <MetricCard label="Current Balance" value={summary?.current_balance} color={toNumber(summary?.current_balance) >= 0 ? 'text-cyan-400' : 'text-rose-400'} />
          <TopCategoryCard category={topCategory} />
          <MetricCard label="Remaining Budget" value={summary?.remaining_budget} color={toNumber(summary?.remaining_budget) >= 0 ? 'text-amber-400' : 'text-rose-400'} />
        </div>

        <div className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {['Expense Records', 'Savings & Analytics'].map((label, index) => <button key={label} onClick={() => setActiveSlide(index)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${activeSlide === index ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white'}`}>{label}</button>)}
          </div>
          <div className="flex items-center gap-2 px-3">{[0, 1].map((index) => <button key={index} onClick={() => setActiveSlide(index)} aria-label={`Show ${index === 0 ? 'expenses' : 'savings'}`} className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-6 bg-emerald-500' : 'w-2.5 bg-slate-700'}`} />)}</div>
        </div>

        <div className="relative overflow-hidden min-h-[380px]">
          {activeSlide === 0 ? <ExpenseTable expenses={expenses} /> : <><VisualAnalytics income={summary?.total_income} expense={summary?.total_expense} categories={categoryData} monthlyTrendData={monthlyTrendData} /><SavingsAnalytics goals={savingsGoals} totalIncome={summary?.total_income} totalExpense={summary?.total_expense} currentBalance={summary?.current_balance} /></>}
        </div>
      </>}
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl"><p className="text-[11px] font-bold tracking-wider uppercase text-slate-500">{label}</p><h3 className={`text-2xl font-extrabold mt-2 ${color}`}>₹{formatCurrency(value)}</h3></div>;
}

function TopCategoryCard({ category }) {
  return <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl"><p className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Top Category</p><h3 className="text-xl font-extrabold mt-2 text-amber-400 truncate">{category?.name || 'No expenses'}</h3><p className="mt-1 text-xs text-slate-500">{category ? `₹${formatCurrency(category.value)} spent` : 'No spend in this period'}</p></div>;
}

function VisualAnalytics({ income, expense, categories, monthlyTrendData }) {
  const colors = ['#34d399', '#fb7185', '#a78bfa', '#38bdf8', '#fbbf24', '#f97316'];
  const formatChartCurrency = (value) => `₹${toNumber(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const tooltipOptions = {
    callbacks: {
      label: (context) => `${context.dataset.label || context.label}: ${formatChartCurrency(context.parsed.y ?? context.parsed)}`,
    },
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#cbd5e1' } }, tooltip: tooltipOptions },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
    },
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF',
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels?.length && data.datasets.length) {
              return data.labels.map((label, index) => ({
                text: `${label || 'Uncategorized'} • ${formatChartCurrency(data.datasets[0].data[index])}`,
                fillStyle: data.datasets[0].backgroundColor[index],
                fontColor: '#FFFFFF',
                hidden: false,
                index,
              }));
            }
            return [];
          },
        },
      },
      tooltip: {
        displayColors: true,
        callbacks: {
          title: () => '',
          label: (context) => {
            const label = context.label || 'Category';
            const value = context.raw || 0;
            return `${label}: ${formatChartCurrency(value)}`;
          },
        },
      },
    },
    scales: { x: { display: false }, y: { display: false } },
  };
  const lineOptions = {
    ...barOptions,
    layout: { padding: { left: 24, right: 24 } },
    scales: {
      x: { offset: monthlyTrendData.labels.length === 1, ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
    },
  };
  const incomeExpenseData = { labels: ['Income', 'Expenses'], datasets: [{ label: 'Amount (INR)', data: [toNumber(income), toNumber(expense)], backgroundColor: ['#34d399', '#fb7185'], borderRadius: 8 }] };
  const doughnutData = { labels: categories.map((item) => item.category || item.name || item.source || 'Uncategorized'), datasets: [{ data: categories.map((item) => item.value), backgroundColor: categories.map((_, index) => colors[index % colors.length]), borderColor: '#0f172a', borderWidth: 2 }] };

  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-base font-bold text-white">Income vs Expenses</h2><p className="mt-1 text-xs text-slate-500">Comparison for the selected timeframe</p><div className="mt-6 h-64"><Bar data={incomeExpenseData} options={barOptions} /></div></section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-base font-bold text-white">Expenses by Category</h2><p className="mt-1 text-xs text-slate-500">Interactive category breakdown</p>{!categories.length ? <p className="py-16 text-center text-sm text-slate-500">No expense categories in this period.</p> : <div className="mt-5 h-64"><Doughnut data={doughnutData} options={doughnutOptions} /></div>}</section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 xl:col-span-2"><h2 className="text-base font-bold text-white">Monthly Expense Trend</h2><p className="mt-1 text-xs text-slate-500">Expenses grouped by month in the selected timeframe</p>{!monthlyTrendData.labels.length ? <p className="py-16 text-center text-sm text-slate-500">No expense trend data in this period.</p> : <div className="mt-6 h-64"><Line data={monthlyTrendData} options={lineOptions} /></div>}</section>
  </div>;
}

function buildMonthlyTrendData(expenses) {
  const totals = expenses.reduce((result, expense) => {
    const date = parseLocalDate(expense?.expense_date || expense?.date);
    if (!date) return result;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    result[key] = (result[key] || 0) + toNumber(expense?.amount);
    return result;
  }, {});
  const keys = Object.keys(totals).sort();
  return {
    labels: keys.map((key) => new Date(`${key}-01T00:00:00`).toLocaleString('en-IN', { month: 'short', year: 'numeric' })),
    datasets: [{ label: 'Expenses (INR)', data: keys.map((key) => totals[key]), borderColor: '#fb7185', backgroundColor: 'rgba(251, 113, 133, 0.2)', tension: 0.35, fill: true }],
  };
}

function ExpenseTable({ expenses }) {
  return <div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl transition-all duration-300"><div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-slate-100">Recent Expenses</h2><span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">{expenses?.length || 0} Records</span></div>{!expenses?.length ? <p className="text-xs text-slate-500 py-8 text-center">No expense logs found for this date range.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase"><th className="pb-3">Title</th><th className="pb-3">Category</th><th className="pb-3">Date</th><th className="pb-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-800/50">{expenses.map((expense) => <tr key={expense?.id} className="hover:bg-slate-800/30"><td className="py-3 font-medium text-slate-200">{expense?.title || 'Untitled expense'}</td><td className="py-3"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{expense?.category || 'Uncategorised'}</span></td><td className="py-3 text-slate-400">{expense?.expense_date || expense?.date || '—'}</td><td className="py-3 text-right font-bold text-rose-400">-₹{formatCurrency(expense?.amount)}</td></tr>)}</tbody></table></div>}</div>;
}

function SavingsAnalytics({ goals, totalIncome, totalExpense, currentBalance }) {
  const income = toNumber(totalIncome);
  const netSavings = income - toNumber(totalExpense);
  const balance = Number.isFinite(toNumber(currentBalance)) ? toNumber(currentBalance) : netSavings;
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
  const savingsRateWidth = Math.max(0, Math.min(savingsRate, 100));

  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300"><div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl">{!goals?.length ? <div><h2 className="text-base font-bold text-slate-100 mb-4">Net Savings Summary</h2>{income === 0 ? <p className="text-xs text-slate-500 py-8 text-center">Log income entries to track your savings rate.</p> : <div className="space-y-4"><p className="text-2xl font-extrabold text-emerald-400">₹{balance.toLocaleString('en-IN')}</p><div className="space-y-1.5"><p className="text-xs text-slate-300 font-medium">Savings Rate: {savingsRate.toFixed(1)}%</p><div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${savingsRateWidth}%` }} /></div></div></div>}</div> : <><h2 className="text-base font-bold text-slate-100 mb-4">Savings Goals</h2><div className="space-y-4">{goals.map((goal) => { const progress = toNumber(goal?.progress_percentage ?? (toNumber(goal?.current_amount) / toNumber(goal?.target_amount || 1)) * 100); return <div key={goal?.id} className="space-y-1"><div className="flex justify-between text-xs"><span className="text-slate-300 font-medium">{goal?.goal_name || 'Savings goal'}</span><span className="text-emerald-400 font-bold">{progress.toFixed(0)}%</span></div><div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} /></div></div>; })}</div></>}</div><div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col justify-between"><div><h2 className="text-base font-bold text-slate-100 mb-2">Budget Insights</h2><p className="text-xs text-slate-400 leading-relaxed">Your current spending rate is tracked against your monthly targets. Keep expenses below your budget ceiling to increase your net balance.</p></div><div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl mt-4"><p className="text-xs text-slate-400">Total Spent This Period:</p><p className="text-xl font-bold text-rose-400 mt-1">₹{formatCurrency(totalExpense)}</p></div></div></div>;
}
