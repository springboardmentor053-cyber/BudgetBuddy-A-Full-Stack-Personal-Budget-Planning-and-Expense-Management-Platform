import { useState } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';

function Reports() {
  const [filter, setFilter] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    let url = `/reports/summary/?filter=${filter}`;
    if (filter === 'custom') url += `&start_date=${startDate}&end_date=${endDate}`;
    const res = await api.get(url);
    setReport(res.data);
  };

  return (
    <MainLayout>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Reports</h1>

      <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="current_month">Current Month</option>
          <option value="previous_month">Previous Month</option>
          <option value="custom">Custom Range</option>
        </select>
        {filter === 'custom' && (
          <>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: 'auto' }} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: 'auto' }} />
          </>
        )}
        <button className="primary" onClick={fetchReport}>Generate Report</button>
      </div>

      {report && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#fff' }}>Financial Summary</h3>
            <p style={{ color: '#e4e7ec' }}>Income: ₹{report.financial_summary.total_income}</p>
            <p style={{ color: '#e4e7ec' }}>Expense: ₹{report.financial_summary.total_expense}</p>
            <p style={{ color: '#e4e7ec' }}>Balance: ₹{report.financial_summary.current_balance}</p>
          </div>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#fff' }}>Expense by Category</h3>
            {report.expense_summary.map((e, i) => (
              <p key={i} style={{ color: '#e4e7ec', textTransform: 'capitalize' }}>{e.category}: ₹{e.total}</p>
            ))}
          </div>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#fff' }}>Income by Source</h3>
            {report.income_summary.map((s, i) => (
              <p key={i} style={{ color: '#e4e7ec' }}>{s.source}: ₹{s.total}</p>
            ))}
          </div>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: '#fff' }}>Savings Summary</h3>
            {report.savings_summary.map((s, i) => (
              <p key={i} style={{ color: '#e4e7ec' }}>{s.goal_name}: ₹{s.saved_amount}/{s.target_amount} ({s.status})</p>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Reports;