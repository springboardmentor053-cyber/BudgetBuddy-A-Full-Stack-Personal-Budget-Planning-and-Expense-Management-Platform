import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [extremeExpenses, setExtremeExpenses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [dashboardRes, extremeRes] = await Promise.all([
          API.get('analytics/dashboard/'),
          API.get('analytics/extreme-expenses/'),
        ]);

        setDashboardData(dashboardRes.data);
        setExtremeExpenses(extremeRes.data);
      } catch (err) {
        console.error('Error fetching analytics backend data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <div className="card"><p style={{ color: '#fff' }}>Loading Analytics Dashboard...</p></div>;
  }

  if (!dashboardData) {
    return <div className="card"><p style={{ color: '#fff' }}>Failed to load analytics data.</p></div>;
  }

  const {
    financial_summary,
    category_wise_analysis,
    monthly_trend,
    recent_transactions,
    latest_notifications,
    active_savings_goals,
  } = dashboardData;

  // 1. Doughnut Chart: Category-wise Spending
  const categoryChartData = {
    labels: Object.keys(category_wise_analysis || {}),
    datasets: [
      {
        data: Object.values(category_wise_analysis || {}),
        backgroundColor: [
          '#ff3b6b',
          '#f59e0b',
          '#00e676',
          '#29b6f6',
          '#ab47bc',
          '#ec4899',
          '#ff7043',
        ],
        borderWidth: 0,
      },
    ],
  };

  // 2. Line Chart: Monthly Expense Trend
  const monthlyTrendChartData = {
    labels: Object.keys(monthly_trend || {}),
    datasets: [
      {
        label: 'Monthly Expense Trend (₹)',
        data: Object.values(monthly_trend || {}),
        borderColor: '#29b6f6',
        backgroundColor: 'rgba(41, 182, 246, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // 3. Bar Chart: Income vs Expenses Comparison
  const incomeVsExpenseBarData = {
    labels: ['Financial Overview'],
    datasets: [
      {
        label: 'Total Income (₹)',
        data: [financial_summary?.total_income || 0],
        backgroundColor: '#00e676',
        borderRadius: 6,
      },
      {
        label: 'Total Expense (₹)',
        data: [financial_summary?.total_expense || 0],
        backgroundColor: '#ff3b6b',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Financial Summary Cards */}
      <div className="card">
        <h3 className="card-title">Financial Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginTop: '10px' }}>
          <SummaryBox label="Total Income" amount={`₹${financial_summary.total_income}`} color="#00e676" />
          <SummaryBox label="Total Expense" amount={`₹${financial_summary.total_expense}`} color="#ff3b6b" />
          <SummaryBox label="Current Balance" amount={`₹${financial_summary.current_balance}`} color="#29b6f6" />
          <SummaryBox label="Total Savings" amount={`₹${financial_summary.total_savings}`} color="#ab47bc" />
          <SummaryBox label="Remaining Budget" amount={`₹${financial_summary.remaining_budget}`} color="#f59e0b" />
        </div>
      </div>

      {/* Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Doughnut Chart */}
        <div className="card">
          <h3 className="card-title">Category-wise Spending</h3>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            {Object.keys(category_wise_analysis || {}).length > 0 ? (
              <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p style={{ color: '#888', alignSelf: 'center' }}>No category spending recorded</p>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="card">
          <h3 className="card-title">Monthly Expense Trend</h3>
          <div style={{ height: '250px' }}>
            {Object.keys(monthly_trend || {}).length > 0 ? (
              <Line data={monthlyTrendChartData} options={{ maintainAspectRatio: false, responsive: true }} />
            ) : (
              <p style={{ color: '#888', textAlign: 'center', marginTop: '100px' }}>No monthly trend recorded</p>
            )}
          </div>
        </div>

        {/* Bar Chart: Income vs Expense Comparison */}
        <div className="card">
          <h3 className="card-title">Income vs Expense Comparison</h3>
          <div style={{ height: '250px' }}>
            <Bar data={incomeVsExpenseBarData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>

        {/* Progress Visualization for Savings Goals */}
        <div className="card">
          <h3 className="card-title">Savings Goals Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', maxHeight: '250px', overflowY: 'auto' }}>
            {active_savings_goals && active_savings_goals.length > 0 ? (
              active_savings_goals.map((goal, idx) => {
                const target = parseFloat(goal.target_amount) || 0;
                const saved = parseFloat(goal.saved_amount || goal.current_amount) || 0;
                const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

                return (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: '#fff' }}>{goal.goal_name}</strong>
                      <span style={{ fontSize: '12px', color: '#ab47bc' }}>{progress}%</span>
                    </div>
                    <div style={{ background: '#334155', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, background: progress >= 100 ? '#00e676' : '#ab47bc', height: '100%', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#8c93a8', marginTop: '4px' }}>
                      ₹{saved} of ₹{target}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#888', textAlign: 'center', marginTop: '80px' }}>No active savings goals found</p>
            )}
          </div>
        </div>

      </div>

      {/* Extreme Expenses Overview */}
      {extremeExpenses && (
        <div className="card">
          <h3 className="card-title">Expense Highlights (Highest & Lowest)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '10px' }}>
            <HighlightBox title="Highest Expense" item={extremeExpenses.highest_expense} color="#ff3b6b" />
            <HighlightBox title="Lowest Expense" item={extremeExpenses.lowest_expense} color="#00e676" />
            <HighlightBox title="Latest Expense" item={extremeExpenses.latest_expense} color="#29b6f6" />
            <HighlightBox title="Oldest Expense" item={extremeExpenses.oldest_expense} color="#f59e0b" />
          </div>
        </div>
      )}

      {/* Lower Activity Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Recent Transactions */}
        <div className="card">
          <h3 className="card-title">Recent Transactions</h3>
          <div style={{ marginTop: '10px' }}>
            {recent_transactions && recent_transactions.length > 0 ? (
              recent_transactions.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                  <span>{item.title}</span>
                  <span style={{ color: item.type === 'INCOME' ? '#00e676' : '#ff3b6b', fontWeight: 'bold' }}>
                    {item.type === 'INCOME' ? '+' : '-'}₹{item.amount}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#888' }}>No recent activity</p>
            )}
          </div>
        </div>

        {/* Latest Notifications */}
        <div className="card">
          <h3 className="card-title">Notifications</h3>
          <div style={{ marginTop: '10px' }}>
            {latest_notifications && latest_notifications.length > 0 ? (
              latest_notifications.map((notif, idx) => (
                <div key={idx} style={{ padding: '8px', marginBottom: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                  <strong style={{ fontSize: '14px' }}>{notif.title}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#aaa' }}>{notif.message}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#888' }}>No notifications</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

const SummaryBox = ({ label, amount, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${color}` }}>
    <span style={{ fontSize: '12px', color: '#aaa' }}>{label}</span>
    <h4 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '16px' }}>{amount}</h4>
  </div>
);

const HighlightBox = ({ title, item, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', borderTop: `3px solid ${color}` }}>
    <span style={{ fontSize: '12px', color: '#aaa' }}>{title}</span>
    {item ? (
      <div style={{ marginTop: '4px' }}>
        <strong style={{ display: 'block', fontSize: '14px', color: '#fff' }}>{item.title}</strong>
        <span style={{ color: color, fontWeight: 'bold' }}>₹{item.amount}</span>
      </div>
    ) : (
      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>N/A</p>
    )}
  </div>
);

export default Analytics;