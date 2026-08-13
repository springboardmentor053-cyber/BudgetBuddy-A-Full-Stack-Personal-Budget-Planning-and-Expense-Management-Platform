import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const categoryColors = {
  FOOD: { bg: '#eef2f6', text: '#3b82f6' },
  TRAVEL: { bg: '#fef3c7', text: '#d97706' },
  SHOPPING: { bg: '#e0f2fe', text: '#0284c7' },
  BILLS: { bg: '#f3e8ff', text: '#9333ea' },
  EDUCATION: { bg: '#dcfce7', text: '#15803d' },
  HEALTHCARE: { bg: '#fee2e2', text: '#dc2626' },
  ENTERTAINMENT: { bg: '#fce7f3', text: '#db2777' },
  MISCELLANEOUS: { bg: '#f3f4f6', text: '#4b5563' }
};

const priorityColors = {
  HIGH: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
  MEDIUM: { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
  LOW: { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' }
};

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/');
      setData(response.data);
    } catch (err) {
      setError('Failed to load dashboard summaries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '16px', fontWeight: '500' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ paddingTop: '20px' }}>
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', borderRadius: '6px' }}>
          {error || 'Error loading dashboard.'}
        </div>
      </div>
    );
  }

  const fin = data.financial_summary || {
    total_income: data.total_income || 0,
    total_expense: data.total_expense || 0,
    current_balance: data.current_balance || data.remaining_balance || 0,
    total_budget: data.total_budget || 0,
    remaining_budget: data.remaining_budget || 0,
    total_savings: data.total_savings || 0,
  };

  const categoryBreakdown = data.category_breakdown || [];
  const monthlyExpenses = data.monthly_expenses || [];
  const recentTransactions = data.recent_transactions || [];
  const latestNotifications = data.latest_notifications || [];
  const activeSavingsGoals = data.active_savings_goals || [];

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      
      {/* Page Header */}
      <header className="page-header d-flex justify-between align-center mb-6">
        <div>
          <h1 className="page-title" style={{ fontSize: '26px', fontWeight: '700', margin: 0 }}>Dashboard Overview</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Welcome back! Here is a live breakdown of your personal finances.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/reports" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
            View Reports
          </Link>
          <button onClick={fetchDashboardData} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
            Refresh
          </button>
        </div>
      </header>

      {/* 1. FINANCIAL SUMMARY KPI CARDS */}
      <section className="mb-8">
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Financial Summary</h2>
        <div className="grid-12 gap-4">
          
          <div className="card col-span-4 p-5" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(22, 163, 74, 0.1) 100%)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Income</h3>
            <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#16a34a' }}>
              +${formatCurrency(fin.total_income)}
            </p>
          </div>

          <div className="card col-span-4 p-5" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expense</h3>
            <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#dc2626' }}>
              -${formatCurrency(fin.total_expense)}
            </p>
          </div>

          <div className="card col-span-4 p-5" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Balance</h3>
            <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: fin.current_balance >= 0 ? '#16a34a' : '#dc2626' }}>
              ${formatCurrency(fin.current_balance)}
            </p>
          </div>

          <div className="card col-span-4 p-5" style={{ borderRadius: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Budget</h3>
            <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#9333ea' }}>
              ${formatCurrency(fin.total_budget)}
            </p>
          </div>

          <div className="card col-span-4 p-5" style={{ borderRadius: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining Budget</h3>
            <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: fin.remaining_budget >= 0 ? '#16a34a' : '#dc2626' }}>
              ${formatCurrency(fin.remaining_budget)}
            </p>
          </div>

          <div className="card col-span-4 p-5" style={{ borderRadius: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Savings</h3>
            <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#0284c7' }}>
              ${formatCurrency(fin.total_savings)}
            </p>
          </div>

        </div>
      </section>


      {/* TWO COLUMN GRID FOR CATEGORY ANALYSIS & MONTHLY TREND */}
      <div className="grid-12 gap-6 mb-8">
        
        {/* 2. CATEGORY-WISE ANALYSIS */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Category-wise Analysis</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No expense category data found.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {categoryBreakdown.map((cat, idx) => {
                const colors = categoryColors[cat.category] || categoryColors.MISCELLANEOUS;
                return (
                  <div key={idx}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <span className="font-semibold" style={{ color: colors.text }}>{cat.category}</span>
                      <span>${cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, cat.percentage)}%`, height: '100%', backgroundColor: colors.text, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. MONTHLY TREND */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Monthly Trend</h3>
          {monthlyExpenses.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No monthly expense data found.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {monthlyExpenses.map((m, idx) => (
                <div key={idx} className="d-flex justify-between align-center p-3" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '8px' }}>
                  <span className="font-semibold" style={{ fontSize: '13px' }}>{m.month}</span>
                  <span className="font-bold" style={{ fontSize: '14px', color: '#dc2626' }}>${m.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* TWO COLUMN GRID FOR SAVINGS GOALS & NOTIFICATIONS */}
      <div className="grid-12 gap-6 mb-8">

        {/* 4. ACTIVE SAVINGS GOALS */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Active Savings Goals</h3>
          {activeSavingsGoals.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No active savings goals found.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {activeSavingsGoals.map((g) => {
                const target = parseFloat(g.target_amount || 0);
                const saved = parseFloat(g.saved_amount || 0);
                const pct = g.progress_percentage !== undefined ? parseFloat(g.progress_percentage) : (target > 0 ? (saved / target * 100) : 0);

                return (
                  <div key={g.id} className="p-3" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '8px' }}>
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                      <strong className="font-semibold">{g.goal_name}</strong>
                      <span>${saved.toFixed(2)} / ${target.toFixed(2)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: '#22c55e' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. LATEST NOTIFICATIONS */}
        <div className="card col-span-6 p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Latest Notifications</h3>
          {latestNotifications.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No notifications found.</p>
          ) : (
            <div className="d-flex flex-column gap-2 mt-4">
              {latestNotifications.map((n) => {
                const pColor = priorityColors[n.priority] || priorityColors.LOW;
                return (
                  <div key={n.id} className="p-3" style={{ borderLeft: `4px solid ${pColor.border}`, backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '6px' }}>
                    <div className="d-flex justify-between align-center mb-1">
                      <strong style={{ fontSize: '13px' }}>{n.title}</strong>
                      <span className="badge" style={{ backgroundColor: pColor.bg, color: pColor.text, fontSize: '10px', fontWeight: 'bold' }}>
                        {n.priority}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{n.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 6. RECENT TRANSACTIONS */}
      <section>
        <div className="card p-5" style={{ borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: '13px', marginTop: '12px' }}>No recent transaction history found.</p>
          ) : (
            <div className="d-flex flex-column gap-3 mt-4">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type?.toLowerCase() === 'income';
                const colors = !isIncome ? (categoryColors[tx.category] || categoryColors.MISCELLANEOUS) : null;
                
                return (
                  <div key={`${tx.type}-${tx.id}`} className="d-flex align-center justify-between p-3" style={{
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary, #f8fafc)',
                    border: '1px solid var(--border-color, #e2e8f0)'
                  }}>
                    <div className="d-flex align-center gap-3">
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isIncome ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                        color: isIncome ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {isIncome ? '↙' : '↗'}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ fontSize: '13px' }}>{tx.title}</div>
                        <div className="d-flex align-center gap-2 mt-1">
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.date}</span>
                          {!isIncome && (
                            <span className="badge" style={{ backgroundColor: colors.bg, color: colors.text, fontSize: '10px' }}>
                              {tx.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="font-bold text-right" style={{ fontSize: '14px', color: isIncome ? '#16a34a' : '#dc2626' }}>
                      {isIncome ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
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

export default Dashboard;
