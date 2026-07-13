import React, { useState, useEffect } from 'react';
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', borderRadius: '4px', fontFamily: 'sans-serif' }}>
        {error || 'Error loading dashboard.'}
      </div>
    );
  }

  const {
    total_income,
    total_expense,
    remaining_balance,
    income_count,
    expense_count,
    recent_transactions
  } = data;

  const totalTransactions = income_count + expense_count;

  return (
    <div className="container">
      
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back! Here is a live breakdown of your personal finances.</p>
      </header>

      {/* Metrics Cards Grid */}
      <section className="grid-12 mb-8">
        
        {/* Card 1: Balance */}
        <div className="card col-span-3 d-flex flex-column justify-between" style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
          color: '#ffffff',
          minHeight: '120px',
          border: 'none',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, fontWeight: 'var(--weight-semibold)', color: '#ffffff' }}>Remaining Balance</h3>
          <p className="font-bold m-0" style={{ fontSize: 'var(--text-2xl)', marginTop: '12px' }}>
            ${remaining_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card 2: Income */}
        <div className="card card-hover col-span-3 d-flex flex-column justify-between" style={{ minHeight: '120px' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 'var(--weight-semibold)' }}>Total Income</h3>
          <p className="font-bold m-0" style={{ fontSize: 'var(--text-2xl)', color: 'var(--success)', marginTop: '12px' }}>
            +${total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card 3: Expense */}
        <div className="card card-hover col-span-3 d-flex flex-column justify-between" style={{ minHeight: '120px' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 'var(--weight-semibold)' }}>Total Expenses</h3>
          <p className="font-bold m-0" style={{ fontSize: 'var(--text-2xl)', color: 'var(--error)', marginTop: '12px' }}>
            -${total_expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card 4: Count Details */}
        <div className="card card-hover col-span-3 d-flex flex-column justify-between" style={{ minHeight: '120px' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 'var(--weight-semibold)' }}>Summary Stats</h3>
          <div className="d-flex justify-between align-center mt-3">
            <div>
              <span className="font-bold text-primary-color" style={{ fontSize: 'var(--text-lg)' }}>{totalTransactions}</span>
              <span className="d-flex" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Txns Total</span>
            </div>
            <div className="text-right">
              <span className="font-semibold d-flex justify-end" style={{ fontSize: 'var(--text-sm)', color: 'var(--success)' }}>{income_count} Incomes</span>
              <span className="font-semibold d-flex justify-end" style={{ fontSize: 'var(--text-sm)', color: 'var(--error)' }}>{expense_count} Expenses</span>
            </div>
          </div>
        </div>

      </section>

      {/* Main Layout - Recent Transactions Feed */}
      <section className="grid-12">
        
        <div className="card col-span-12">
          <div className="d-flex justify-between align-center mb-6">
            <h2 className="m-0" style={{ fontSize: 'var(--text-lg)' }}>Recent Transactions</h2>
            <button
              onClick={fetchDashboardData}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
            >
              Refresh
            </button>
          </div>

          {recent_transactions.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>No transaction history found. Start recording income or expenses to see them here!</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {recent_transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const colors = !isIncome ? (categoryColors[tx.category] || categoryColors.MISCELLANEOUS) : null;
                
                return (
                  <div key={`${tx.type}-${tx.id}`} className="d-flex align-center justify-between p-4" style={{
                    borderRadius: 'var(--radius-base)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    transition: 'all var(--transition-fast)'
                  }}>
                    
                    <div className="d-flex align-center gap-4">
                      {/* Icon Bubble */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isIncome ? 'var(--success-light)' : 'var(--error-light)',
                        color: isIncome ? 'var(--success)' : 'var(--error)',
                        fontWeight: 'bold',
                        fontSize: 'var(--text-lg)'
                      }}>
                        {isIncome ? '↙' : '↗'}
                      </div>

                      {/* Details */}
                      <div>
                        <div className="font-semibold text-primary-color" style={{ fontSize: 'var(--text-sm)' }}>{tx.title}</div>
                        <div className="d-flex align-center gap-2 mt-1">
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{tx.date}</span>
                          {!isIncome && (
                            <span className="badge" style={{ backgroundColor: colors.bg, color: colors.text }}>
                              {tx.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="font-bold text-right" style={{
                      fontSize: 'var(--text-base)',
                      color: isIncome ? 'var(--success)' : 'var(--error)'
                    }}>
                      {isIncome ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      {tx.description && (
                        <div className="font-medium" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tx.description.length > 25 ? `${tx.description.substring(0, 25)}...` : tx.description}
                        </div>
                      )}
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
