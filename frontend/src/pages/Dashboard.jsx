import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const currency = (value) => `₹${Number(value || 0).toFixed(2)}`;

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [incomeItems, setIncomeItems] = useState([]);
  const [expenseItems, setExpenseItems] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const allTimeParams = { all_time: true };
        const [dashboardRes, reportRes, incomeRes, expenseRes] = await Promise.all([
          api.get('reports/dashboard/', { params: allTimeParams }),
          api.get('reports/combined-report/', { params: allTimeParams }),
          api.get('income/', { params: allTimeParams }),
          api.get('expenses/', { params: allTimeParams }),
        ]);

        const dashboardDataRaw = dashboardRes.data || {};
        const reportData = reportRes.data || {};
        const rawIncome = Array.isArray(incomeRes.data) ? incomeRes.data : (incomeRes.data?.results || []);
        const rawExpenses = Array.isArray(expenseRes.data) ? expenseRes.data : (expenseRes.data?.results || []);

        setDashboardData({
          financial_summary: {
            total_income: Number(reportData.financial_summary?.total_income ?? dashboardDataRaw.financial_summary?.total_income ?? 0),
            total_expense: Number(reportData.financial_summary?.total_expense ?? dashboardDataRaw.financial_summary?.total_expense ?? 0),
            current_balance: Number(reportData.financial_summary?.current_balance ?? dashboardDataRaw.financial_summary?.current_balance ?? 0),
            total_savings: Number(reportData.financial_summary?.total_savings ?? dashboardDataRaw.financial_summary?.total_savings ?? 0),
            remaining_budget: Number(reportData.financial_summary?.remaining_budget ?? dashboardDataRaw.financial_summary?.remaining_budget ?? 0),
          },
          category_wise_analysis: reportData.category_analysis || dashboardDataRaw.category_wise_analysis || {},
          monthly_trend: reportData.monthly_trend || dashboardDataRaw.monthly_trend || {},
          income_summary: reportData.income_summary || [],
          expense_summary: reportData.expense_summary || [],
          recent_transactions: dashboardDataRaw.recent_transactions || [],
        });

        setIncomeItems(rawIncome);
        setExpenseItems(rawExpenses);
      } catch (err) {
        console.error('Dashboard load failed:', err);
        setError('Unable to load dashboard data right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('appTheme') || 'light');
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const financialSummary = dashboardData?.financial_summary || {};
  const categoryAnalysis = dashboardData?.category_wise_analysis || {};
  const monthlyTrend = dashboardData?.monthly_trend || {};

  const transactions = useMemo(() => {
    const mappedExpenses = expenseItems.map((item) => ({
      id: `expense-${item.id}`,
      kind: 'expense',
      title: item.title || 'Expense',
      category: item.category || 'General',
      amount: Number(item.amount || 0),
      date: item.expense_date || item.created_at || '',
      note: item.description || item.title || 'Expense entry',
    }));

    const mappedIncome = incomeItems.map((item) => ({
      id: `income-${item.id}`,
      kind: 'income',
      title: item.title || item.source || 'Income',
      category: item.source || 'Income',
      amount: Number(item.amount || 0),
      date: item.income_date || item.created_at || '',
      note: item.description || item.title || 'Income entry',
    }));

    return [...mappedExpenses, ...mappedIncome].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomeItems, expenseItems]);

  const computedIncomeTotal = useMemo(
    () => transactions.filter((item) => item.kind === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [transactions]
  );
  const computedExpenseTotal = useMemo(
    () => transactions.filter((item) => item.kind === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [transactions]
  );

  const income = Number(financialSummary.total_income || computedIncomeTotal || 0);
  const expense = Number(financialSummary.total_expense || computedExpenseTotal || 0);
  const savings = Number(financialSummary.total_savings || 0);
  const balance = Number(financialSummary.current_balance || (income - expense));
  const remainingBudget = Number(financialSummary.remaining_budget || 0);
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expense / income) * 100 : 0;

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryAnalysis || {});
    if (!entries.length) return null;
    return entries.map(([category, value]) => ({ category, value: Number(value || 0) })).sort((a, b) => b.value - a.value)[0];
  }, [categoryAnalysis]);

  const categoryChartData = useMemo(() => {
    const entries = Object.entries(categoryAnalysis || {})
      .map(([category, value]) => [category, Number(value || 0)])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: entries.map(([category]) => category),
      datasets: [{
        label: 'Expense by category',
        data: entries.map(([, value]) => value),
        backgroundColor: ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'],
        borderWidth: 0,
      }],
    };
  }, [categoryAnalysis]);

  const incomeExpenseChartData = useMemo(() => ({
    labels: ['Income', 'Expense', 'Savings'],
    datasets: [{
      label: 'Rupees',
      data: [income, expense, savings],
      backgroundColor: ['#22c55e', '#ef4444', '#8b5cf6'],
      borderRadius: 12,
    }],
  }), [income, expense, savings]);

  const trendChartData = useMemo(() => {
    const entries = Object.entries(monthlyTrend || {});
    return {
      labels: entries.map(([label]) => label),
      datasets: [{
        label: 'Monthly spend',
        data: entries.map(([, value]) => Number(value || 0)),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      }],
    };
  }, [monthlyTrend]);

  return (
    <MainLayout pageTitle="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section style={{
          background: isDark ? 'linear-gradient(145deg, #0f172a, #172554)' : 'linear-gradient(145deg, #eff6ff, #dbeafe)',
          borderRadius: '24px',
          padding: '22px',
          boxShadow: isDark ? '0 18px 40px rgba(15, 23, 42, 0.45)' : '0 18px 40px rgba(59, 130, 246, 0.12)',
          border: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: isDark ? '#93c5fd' : '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.72rem', fontWeight: 800 }}>Financial overview</p>
              <h3 style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '1.4rem' }}>Your money at a glance</h3>
            </div>
          </div>
          <div style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '18px',
            padding: '18px',
            border: `1px solid ${isDark ? '#334155' : '#dbeafe'}`,
            color: isDark ? '#dbeafe' : '#334155'
          }}>
            Review your income, expenses, balance, savings, and recent activity below.
          </div>
        </section>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: '14px', fontWeight: 700 }}>
            {error}
          </div>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total income', value: currency(income), accent: 'linear-gradient(135deg, #0f766e, #22c55e)' },
            { label: 'Total expense', value: currency(expense), accent: 'linear-gradient(135deg, #b91c1c, #fb7185)' },
            { label: 'Current balance', value: currency(balance), accent: 'linear-gradient(135deg, #1d4ed8, #38bdf8)' },
            { label: 'Remaining budget', value: currency(remainingBudget), accent: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
          ].map((card) => (
            <div key={card.label} style={{ background: card.accent, color: 'white', borderRadius: '22px', padding: '20px', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.14)' }}>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', fontWeight: 800, opacity: 0.95 }}>{card.label}</div>
              <div style={{ marginTop: '12px', fontSize: '2rem', fontWeight: 900 }}>{card.value}</div>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
            <h3 style={{ marginTop: 0, color: isDark ? '#f8fafc' : '#102a43' }}>Income vs Expense</h3>
            <div style={{ height: '260px' }}>
              <Bar
                data={incomeExpenseChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { ticks: { color: isDark ? '#cbd5e1' : '#475569' }, grid: { display: false } },
                    y: { ticks: { color: isDark ? '#cbd5e1' : '#475569' }, grid: { color: isDark ? '#334155' : '#e2e8f0' } },
                  },
                }}
              />
            </div>
          </div>

          <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
            <h3 style={{ marginTop: 0, color: isDark ? '#f8fafc' : '#102a43' }}>Category breakdown</h3>
            <div style={{ height: '260px' }}>
              {categoryChartData.labels.length ? (
                <Doughnut
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: isDark ? '#e2e8f0' : '#334155' },
                      },
                    },
                  }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No category data yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={{ background: isDark ? '#1e293b' : 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
          <h3 style={{ marginTop: 0, color: isDark ? '#f8fafc' : '#102a43' }}>Monthly trend</h3>
          <div style={{ height: '280px' }}>
            {trendChartData.labels.length ? (
              <Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: isDark ? '#e2e8f0' : '#334155' },
                    },
                  },
                  scales: {
                    x: { ticks: { color: isDark ? '#cbd5e1' : '#475569' }, grid: { display: false } },
                    y: { ticks: { color: isDark ? '#cbd5e1' : '#475569' }, grid: { color: isDark ? '#334155' : '#e2e8f0' } },
                  },
                }}
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                No monthly trend data yet.
              </div>
            )}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '18px', alignItems: 'start' }}>
          <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: isDark ? '#f8fafc' : '#102a43' }}>Transaction history</h3>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{transactions.length} records across income and expenses</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: isDark ? '#cbd5e1' : '#334155', fontWeight: 700 }}>Loading dashboard data...</div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>No transactions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                {transactions.map((item) => (
                  <div key={item.id} style={{
                    borderRadius: '16px',
                    padding: '14px 16px',
                    background: isDark ? (item.kind === 'income' ? '#11261a' : '#241d10') : (item.kind === 'income' ? '#f0fff4' : '#fff7ed'),
                    border: `1px solid ${item.kind === 'income' ? '#22c55e55' : '#fb923c55'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong style={{ color: isDark ? '#f8fafc' : '#102a43' }}>{item.title}</strong>
                        <span style={{ padding: '4px 10px', borderRadius: '999px', background: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#e2e8f0' : '#0f172a', fontSize: '0.75rem', fontWeight: 800 }}>{item.kind.toUpperCase()}</span>
                      </div>
                      <div style={{ marginTop: '6px', color: isDark ? '#cbd5e1' : '#64748b', fontSize: '0.88rem' }}>
                        {item.category} • {item.date ? new Date(item.date).toLocaleDateString() : 'No date'}
                      </div>
                      <div style={{ marginTop: '4px', color: isDark ? '#94a3b8' : '#94a3b8', fontSize: '0.82rem' }}>{item.note}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: item.kind === 'income' ? '#15803d' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {item.kind === 'income' ? '+' : '-'}{currency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: '20px', padding: '22px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
              <h3 style={{ margin: 0, color: isDark ? '#f8fafc' : '#102a43' }}>Monthly summary</h3>
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <SummaryRow label="Savings rate" value={`${savingsRate.toFixed(1)}%`} isDark={isDark} />
                <SummaryRow label="Expense ratio" value={`${expenseRatio.toFixed(1)}%`} isDark={isDark} />
                <SummaryRow label="Top category" value={topCategory ? `${topCategory.category} ${currency(topCategory.value)}` : 'None yet'} isDark={isDark} />
                <SummaryRow label="Monthly trend points" value={Object.keys(monthlyTrend || {}).length ? Object.keys(monthlyTrend).length : '0'} isDark={isDark} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function SummaryRow({ label, value, isDark }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: isDark ? '#0f172a' : '#f8fafc' }}>
      <span style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>{label}</span>
      <span style={{ color: isDark ? '#f8fafc' : '#102a43', fontWeight: 800, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default Dashboard;
