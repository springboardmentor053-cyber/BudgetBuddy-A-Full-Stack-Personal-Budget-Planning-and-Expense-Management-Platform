import React, { useState, useEffect } from 'react';
import api from '../services/api';

const categoryColors = {
  FOOD: '#3b82f6',
  TRAVEL: '#d97706',
  SHOPPING: '#0284c7',
  BILLS: '#9333ea',
  EDUCATION: '#15803d',
  HEALTHCARE: '#dc2626',
  ENTERTAINMENT: '#db2777',
  MISCELLANEOUS: '#4b5563'
};

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/analytics/');
      setData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch analytics metrics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <p className="text-secondary-color">Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="card" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>
          {error || 'Error loading analytics.'}
        </div>
      </div>
    );
  }

  const {
    total_income = 0,
    total_expense = 0,
    total_savings = 0,
    current_balance = 0,
    monthly_expenses = [],
    category_breakdown = [],
    top_spending_category = 'N/A',
    savings_rate = 0,
    income_vs_expense = { total_income, total_expense, net_balance: current_balance, savings_rate },
    budget_utilization = [],
    savings_goal_progress = []
  } = data;

  const maxMonthly = Math.max(...monthly_expenses.map((m) => m.amount), 1);
  const maxIncExp = Math.max(total_income, total_expense, 1);
  const incomePct = Math.min(100, Math.round((total_income / maxIncExp) * 100));
  const expensePct = Math.min(100, Math.round((total_expense / maxIncExp) * 100));

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <header className="page-header d-flex justify-between align-center mb-6">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Comprehensive metrics, comparative charts, savings trends, and budget utilization.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
          Refresh
        </button>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid-12 mb-8 gap-4">
        {/* Current Balance */}
        <div className="card col-span-3 d-flex flex-column justify-between" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', opacity: 0.9 }}>Current Balance</h4>
          <p className="font-bold m-0" style={{ fontSize: '24px', marginTop: '10px' }}>
            ${formatCurrency(current_balance)}
          </p>
        </div>

        {/* Total Income */}
        <div className="card col-span-3 d-flex flex-column justify-between" style={{ padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>Total Income</h4>
          <p className="font-bold m-0" style={{ fontSize: '24px', color: '#16a34a', marginTop: '10px' }}>
            +${formatCurrency(total_income)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="card col-span-3 d-flex flex-column justify-between" style={{ padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>Total Expense</h4>
          <p className="font-bold m-0" style={{ fontSize: '24px', color: '#dc2626', marginTop: '10px' }}>
            -${formatCurrency(total_expense)}
          </p>
        </div>

        {/* Total Savings & Rate */}
        <div className="card col-span-3 d-flex flex-column justify-between" style={{ padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>Total Savings (Rate)</h4>
          <div className="d-flex align-center justify-between mt-2">
            <p className="font-bold m-0" style={{ fontSize: '20px', color: '#2563eb' }}>
              ${formatCurrency(total_savings)}
            </p>
            <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' }}>
              {savings_rate}% Rate
            </span>
          </div>
        </div>
      </section>

      {/* VISUALIZATION 1 & 2: CATEGORY SPENDING & MONTHLY TREND */}
      <section className="grid-12 gap-6 mb-8">
        {/* 1. Category-wise Spending */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <div className="d-flex justify-between align-center mb-4">
            <h3 className="m-0" style={{ fontSize: '16px', fontWeight: '600' }}>Category-wise Spending</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Top: <strong style={{ color: 'var(--primary)' }}>{top_spending_category}</strong>
            </span>
          </div>

          {category_breakdown.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px' }}>No expense category data found.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {category_breakdown.map((cat) => {
                const color = categoryColors[cat.category] || '#4b5563';
                return (
                  <div key={cat.category}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <span className="font-semibold" style={{ color }}>{cat.category}</span>
                      <span>${formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, cat.percentage)}%`, height: '100%', backgroundColor: color, borderRadius: '5px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Monthly Expense Trends */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Monthly Expense Trends</h3>

          {monthly_expenses.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No monthly expense data recorded.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {monthly_expenses.map((m) => {
                const pct = ((m.amount / maxMonthly) * 100).toFixed(1);
                return (
                  <div key={m.month}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <span className="font-semibold">{m.month}</span>
                      <span className="font-bold" style={{ color: '#dc2626' }}>${formatCurrency(m.amount)}</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '5px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* VISUALIZATION 3: INCOME VS EXPENSES COMPARISON */}
      <section className="mb-8">
        <div className="card p-5" style={{ borderRadius: '12px' }}>
          <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Income vs Expenses Comparison</h3>
          
          <div className="grid-12 gap-6 mt-4 align-center">
            {/* Visual Bars */}
            <div className="col-span-8">
              <div className="mb-4">
                <div className="d-flex justify-between mb-1" style={{ fontSize: '13px' }}>
                  <strong style={{ color: '#16a34a' }}>Total Income</strong>
                  <span className="font-bold" style={{ color: '#16a34a' }}>${formatCurrency(total_income)}</span>
                </div>
                <div style={{ width: '100%', height: '14px', backgroundColor: '#f0fdf4', borderRadius: '7px', border: '1px solid #bbf7d0', overflow: 'hidden' }}>
                  <div style={{ width: `${incomePct}%`, height: '100%', backgroundColor: '#16a34a', borderRadius: '6px' }} />
                </div>
              </div>

              <div>
                <div className="d-flex justify-between mb-1" style={{ fontSize: '13px' }}>
                  <strong style={{ color: '#dc2626' }}>Total Expenses</strong>
                  <span className="font-bold" style={{ color: '#dc2626' }}>${formatCurrency(total_expense)}</span>
                </div>
                <div style={{ width: '100%', height: '14px', backgroundColor: '#fef2f2', borderRadius: '7px', border: '1px solid #fecaca', overflow: 'hidden' }}>
                  <div style={{ width: `${expensePct}%`, height: '100%', backgroundColor: '#dc2626', borderRadius: '6px' }} />
                </div>
              </div>
            </div>

            {/* Summary Badge */}
            <div className="col-span-4 p-4 text-center" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Cash Flow</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: current_balance >= 0 ? '#16a34a' : '#dc2626', margin: '4px 0' }}>
                {current_balance >= 0 ? '+' : ''}${formatCurrency(current_balance)}
              </div>
              <span className="badge" style={{ backgroundColor: current_balance >= 0 ? '#dcfce7' : '#fee2e2', color: current_balance >= 0 ? '#15803d' : '#dc2626', fontSize: '11px', fontWeight: 'bold' }}>
                {savings_rate}% Savings Rate
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* VISUALIZATION 4 & 5: SAVINGS PROGRESS & BUDGET UTILIZATION */}
      <section className="grid-12 gap-6">
        {/* 4. Savings Goal Progress */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Savings Goal Progress</h3>
          {savings_goal_progress.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No active savings goals found.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {savings_goal_progress.map((g) => {
                const target = parseFloat(g.target_amount || 0);
                const saved = parseFloat(g.saved_amount || 0);
                const pct = g.progress_percentage !== undefined ? parseFloat(g.progress_percentage) : (target > 0 ? (saved / target * 100) : 0);
                const isCompleted = g.status === 'COMPLETED' || pct >= 100;

                return (
                  <div key={g.id} className="p-3" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '8px' }}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <strong className="font-semibold">{g.goal_name}</strong>
                      <span>${formatCurrency(saved)} / ${formatCurrency(target)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: isCompleted ? '#16a34a' : '#22c55e' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Budget Utilization */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Budget Utilization</h3>
          {budget_utilization.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No monthly budgets defined.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {budget_utilization.map((b) => {
                const pct = parseFloat(b.utilization_percentage || 0);
                let barColor = '#22c55e';
                let badgeBg = '#dcfce7';
                let badgeText = '#15803d';

                if (b.status === 'EXCEEDED' || pct >= 100) {
                  barColor = '#ef4444';
                  badgeBg = '#fee2e2';
                  badgeText = '#dc2626';
                } else if (b.status === 'CRITICAL' || pct >= 90) {
                  barColor = '#f97316';
                  badgeBg = '#ffedd5';
                  badgeText = '#c2410c';
                } else if (b.status === 'WARNING' || pct >= 80) {
                  barColor = '#eab308';
                  badgeBg = '#fef9c3';
                  badgeText = '#a16207';
                }

                return (
                  <div key={b.id} className="p-3" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '8px' }}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <strong className="font-semibold">{b.category}</strong>
                      <div className="d-flex align-center gap-2">
                        <span>${formatCurrency(b.spent_amount)} / ${formatCurrency(b.budget_amount)} ({pct.toFixed(1)}%)</span>
                        <span className="badge" style={{ backgroundColor: badgeBg, color: badgeText, fontSize: '10px', fontWeight: 'bold' }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Analytics;

