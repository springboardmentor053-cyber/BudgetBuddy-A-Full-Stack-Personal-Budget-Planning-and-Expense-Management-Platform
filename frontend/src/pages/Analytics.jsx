import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
      setError('Failed to fetch analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <p className="text-secondary-color">Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <div className="card" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>
          {error || 'Error loading analytics.'}
        </div>
      </div>
    );
  }

  const {
    total_income,
    total_expense,
    total_savings,
    current_balance,
    monthly_expenses,
    category_breakdown,
    top_spending_category,
    savings_rate,
  } = data;

  const maxMonthly = Math.max(...monthly_expenses.map((m) => m.amount), 1);

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Deep insights into your financial health, savings rate, and category breakdowns.</p>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid-12 mb-8">
        {/* Balance Card */}
        <div className="card col-span-3 d-flex flex-column justify-between" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' }}>
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', opacity: 0.9 }}>Current Balance</h4>
          <p className="font-bold m-0" style={{ fontSize: '24px', marginTop: '10px' }}>
            ${current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Income */}
        <div className="card col-span-3 d-flex flex-column justify-between">
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>Total Income</h4>
          <p className="font-bold m-0" style={{ fontSize: '24px', color: '#16a34a', marginTop: '10px' }}>
            +${total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Expense */}
        <div className="card col-span-3 d-flex flex-column justify-between">
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>Total Expense</h4>
          <p className="font-bold m-0" style={{ fontSize: '24px', color: '#dc2626', marginTop: '10px' }}>
            -${total_expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Savings & Rate */}
        <div className="card col-span-3 d-flex flex-column justify-between">
          <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>Total Savings (Rate)</h4>
          <div className="d-flex align-center justify-between mt-2">
            <p className="font-bold m-0" style={{ fontSize: '20px', color: '#2563eb' }}>
              ${total_savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' }}>
              {savings_rate}% Rate
            </span>
          </div>
        </div>
      </section>

      {/* Analytics Breakdown Grid */}
      <section className="grid-12">
        {/* Category Breakdown */}
        <div className="card col-span-6">
          <div className="d-flex justify-between align-center mb-4">
            <h3 className="m-0" style={{ fontSize: '16px' }}>Category Breakdown</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Top: <strong style={{ color: 'var(--primary)' }}>{top_spending_category}</strong>
            </span>
          </div>

          {category_breakdown.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px' }}>No expenses recorded yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {category_breakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                    <span className="font-semibold">{cat.category}</span>
                    <span>${cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Expenses Chart */}
        <div className="card col-span-6">
          <h3 className="mb-4" style={{ fontSize: '16px' }}>Monthly Expenses Trend</h3>

          {monthly_expenses.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px' }}>No monthly expense data recorded.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {monthly_expenses.map((m) => {
                const pct = ((m.amount / maxMonthly) * 100).toFixed(1);
                return (
                  <div key={m.month}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <span className="font-semibold">{m.month}</span>
                      <span>${m.amount.toFixed(2)}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '4px' }} />
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
