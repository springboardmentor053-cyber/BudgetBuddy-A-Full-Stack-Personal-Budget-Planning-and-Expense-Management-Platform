import { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';

const cardStyle = {
  background: '#171d2d', borderRadius: '14px', padding: '20px',
  border: '1px solid #232b3d', flex: 1, minWidth: '180px', color: '#e4e7ec',
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard. Please log in again.'));
  }, []);

  if (error) return <MainLayout><p style={{ color: 'red' }}>{error}</p></MainLayout>;
  if (!data) return <MainLayout><p style={{ color: '#fff' }}>Loading...</p></MainLayout>;

  const { financial_summary, category_wise_analysis, monthly_trend, recent_transactions, latest_notifications, active_savings_goals } = data;

  return (
    <MainLayout>
      <h1 style={{ marginBottom: '20px', color: '#fff' }}>Dashboard</h1>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={{ ...cardStyle, borderTop: '4px solid #28a745' }}>
          <p style={{ color: '#8892a6', margin: 0 }}>Total Income</p>
          <h2 style={{ margin: '5px 0', color: '#fff' }}>₹{financial_summary.total_income}</h2>
        </div>
        <div style={{ ...cardStyle, borderTop: '4px solid #dc3545' }}>
          <p style={{ color: '#8892a6', margin: 0 }}>Total Expenses</p>
          <h2 style={{ margin: '5px 0', color: '#fff' }}>₹{financial_summary.total_expense}</h2>
        </div>
        <div style={{ ...cardStyle, borderTop: '4px solid #007bff' }}>
          <p style={{ color: '#8892a6', margin: 0 }}>Current Balance</p>
          <h2 style={{ margin: '5px 0', color: '#fff' }}>₹{financial_summary.current_balance}</h2>
        </div>
        <div style={{ ...cardStyle, borderTop: '4px solid #ffc107' }}>
          <p style={{ color: '#8892a6', margin: 0 }}>Total Savings</p>
          <h2 style={{ margin: '5px 0', color: '#fff' }}>₹{financial_summary.total_savings}</h2>
        </div>
        <div style={{ ...cardStyle, borderTop: '4px solid #6f42c1' }}>
          <p style={{ color: '#8892a6', margin: 0 }}>Remaining Budget</p>
          <h2 style={{ margin: '5px 0', color: '#fff' }}>₹{financial_summary.remaining_budget}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Category breakdown */}
        <div style={{ ...cardStyle, flex: '1 1 300px' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Spending by Category</h3>
          {Object.entries(category_wise_analysis).map(([cat, amt]) => (
            <div key={cat} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#e4e7ec' }}>
                <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                <span>₹{amt}</span>
              </div>
              <div style={{ background: '#0f1420', borderRadius: '6px', height: '8px' }}>
                <div style={{
                  width: `${Math.min((amt / financial_summary.total_expense) * 100, 100)}%`,
                  background: '#6c5ce7', height: '100%', borderRadius: '6px'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly trend */}
        <div style={{ ...cardStyle, flex: '1 1 300px' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Monthly Trend</h3>
          {monthly_trend.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #232b3d', color: '#e4e7ec' }}>
              <span>{m.month} {m.year}</span>
              <strong style={{ color: '#fff' }}>₹{m.total}</strong>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div style={{ ...cardStyle, flex: '1 1 300px' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Latest Notifications</h3>
          {latest_notifications.map((n) => (
            <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid #232b3d' }}>
              <strong style={{ fontSize: '14px', color: '#fff' }}>{n.title}</strong>
              <p style={{ fontSize: '13px', color: '#8892a6', margin: '2px 0' }}>{n.message}</p>
            </div>
          ))}
        </div>

        {/* Active savings goals */}
        <div style={{ ...cardStyle, flex: '1 1 300px' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Active Savings Goals</h3>
          {active_savings_goals.map((g) => (
            <div key={g.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#e4e7ec' }}>
                <span>{g.goal_name}</span>
                <span>₹{g.saved_amount} / ₹{g.target_amount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div style={{ ...cardStyle, flex: '1 1 100%' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Recent Transactions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#e4e7ec' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #232b3d' }}>
                <th style={{ padding: '8px', color: '#8892a6' }}>Title</th>
                <th style={{ color: '#8892a6' }}>Category</th>
                <th style={{ color: '#8892a6' }}>Date</th>
                <th style={{ textAlign: 'right', color: '#8892a6' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #1e2536' }}>
                  <td style={{ padding: '8px' }}>{t.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{t.category}</td>
                  <td>{t.expense_date}</td>
                  <td style={{ textAlign: 'right' }}>₹{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;