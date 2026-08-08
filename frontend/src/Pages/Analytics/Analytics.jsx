import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';

const COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#e84393', '#fd79a8', '#00cec9'];

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [category, setCategory] = useState({});
  const [trend, setTrend] = useState([]);
  const [highLow, setHighLow] = useState(null);

  useEffect(() => {
    api.get('/analytics/summary/').then((res) => setSummary(res.data));
    api.get('/analytics/category/').then((res) => setCategory(res.data));
    api.get('/analytics/monthly-trend/').then((res) => setTrend(res.data));
    api.get('/analytics/highest-lowest/').then((res) => setHighLow(res.data));
  }, []);

  const pieData = Object.entries(category).map(([name, value]) => ({ name, value }));
  const trendData = trend.map((t) => ({ name: `${t.month.slice(0, 3)} ${t.year}`, total: t.total }));

  return (
    <MainLayout>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Analytics</h1>

      {summary && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            ['Total Income', summary.total_income, '#28a745'],
            ['Total Expense', summary.total_expense, '#dc3545'],
            ['Balance', summary.current_balance, '#007bff'],
            ['Savings', summary.total_savings, '#ffc107'],
          ].map(([label, val, color]) => (
            <div key={label} className="card" style={{ flex: 1, minWidth: '160px', borderTop: `4px solid ${color}` }}>
              <p style={{ color: '#8892a6', margin: 0 }}>{label}</p>
              <h2 style={{ color: '#fff', margin: '5px 0' }}>₹{val}</h2>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div className="card" style={{ flex: '1 1 350px' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#171d2d', border: '1px solid #232b3d', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: '1 1 350px' }}>
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid stroke="#232b3d" />
              <XAxis dataKey="name" stroke="#8892a6" fontSize={12} />
              <YAxis stroke="#8892a6" fontSize={12} />
              <Tooltip contentStyle={{ background: '#171d2d', border: '1px solid #232b3d', color: '#fff' }} />
              <Line type="monotone" dataKey="total" stroke="#6c5ce7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {highLow && (
        <div className="card">
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>Highest & Lowest Expenses</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#e4e7ec', fontSize: '14px' }}>
            <p>🔺 Highest: {highLow.highest_expense?.title} — ₹{highLow.highest_expense?.amount}</p>
            <p>🔻 Lowest: {highLow.lowest_expense?.title} — ₹{highLow.lowest_expense?.amount}</p>
            <p>🕐 Latest: {highLow.latest_expense?.title} — ₹{highLow.latest_expense?.amount}</p>
            <p>📅 Oldest: {highLow.oldest_expense?.title} — ₹{highLow.oldest_expense?.amount}</p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Analytics;