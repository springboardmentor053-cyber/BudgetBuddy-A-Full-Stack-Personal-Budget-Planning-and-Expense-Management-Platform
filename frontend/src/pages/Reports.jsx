import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [dateFilter, setDateFilter] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report states
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch report based on active filter and tab
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      let query = `?period=${dateFilter}`;
      if (dateFilter === 'custom' && startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}`;
      }

      // Parallel fetch for all report endpoints
      const [summaryRes, monthlyRes, expensesRes, savingsRes] = await Promise.all([
        api.get(`/api/reports/summary/${query}`),
        api.get(`/api/reports/monthly/${query}`),
        api.get(`/api/reports/expenses/${query}`),
        api.get(`/api/reports/savings/`),
      ]);

      setSummaryData(summaryRes.data);
      setMonthlyData(monthlyRes.data);
      setExpensesData(expensesRes.data);
      setSavingsData(savingsRes.data);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError('Failed to load financial reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter !== 'custom' || (startDate && endDate)) {
      fetchReports();
    }
  }, [dateFilter]);

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchReports();
    }
  };

  // Official Export 1: Export PDF
  const handleExportPDF = async () => {
    try {
      let query = `?period=${dateFilter}`;
      if (dateFilter === 'custom' && startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await api.get(`/api/reports/export/pdf/${query}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BudgetBuddy_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PDF report:", err);
      alert("Failed to export PDF report.");
    }
  };

  // Official Export 2: Export Excel
  const handleExportExcel = async () => {
    try {
      let query = `?period=${dateFilter}`;
      if (dateFilter === 'custom' && startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await api.get(`/api/reports/export/excel/${query}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BudgetBuddy_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export Excel report:", err);
      alert("Failed to export Excel report.");
    }
  };

  // Backward Compatibility: Export JSON
  const handleExportJSON = async () => {
    try {
      let query = `?period=${dateFilter}&format=json`;
      if (dateFilter === 'custom' && startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}&format=json`;
      }
      const response = await api.get(`/api/reports/export/${query}`);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `BudgetBuddy_Report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to export JSON report:", err);
      alert("Failed to export JSON report.");
    }
  };

  // Helper formatting values
  const fin = summaryData?.financial_summary || monthlyData || {};
  const expSummary = summaryData?.expense_summary || {};
  const notifications = summaryData?.latest_notifications || [];

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <header className="page-header d-flex justify-between align-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="page-title" style={{ fontSize: '26px', fontWeight: '700', margin: 0 }}>
            Financial Reports & Analytics
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Comprehensive overview, detailed monthly breakdown, expense tracing & goal insights.
          </p>
        </div>

        {/* Primary Export Buttons (Module 9 Specification) */}
        <div className="d-flex align-center gap-2 flex-wrap">
          <button onClick={handleExportPDF} className="btn btn-primary d-flex align-center gap-2" style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '13px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
          
          <button onClick={handleExportExcel} className="btn btn-success d-flex align-center gap-2" style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>

          <button onClick={handleExportJSON} className="btn btn-outline d-flex align-center gap-1" style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }} title="JSON Export for Backward Compatibility">
            JSON
          </button>
        </div>
      </header>

      {/* Date Filter Bar */}
      <div className="card mb-6 p-4" style={{ borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <div className="d-flex align-center justify-between flex-wrap gap-4">
          <div className="d-flex align-center gap-2">
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Period:</span>
            <button
              onClick={() => setDateFilter('current_month')}
              className={`btn ${dateFilter === 'current_month' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '6px' }}
            >
              Current Month
            </button>
            <button
              onClick={() => setDateFilter('previous_month')}
              className={`btn ${dateFilter === 'previous_month' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '6px' }}
            >
              Previous Month
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`btn ${dateFilter === 'custom' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '6px' }}
            >
              Custom Range
            </button>
          </div>

          {dateFilter === 'custom' && (
            <form onSubmit={handleApplyCustomDate} className="d-flex align-center gap-2 flex-wrap">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
                style={{ padding: '5px 10px', fontSize: '13px', borderRadius: '6px' }}
                required
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
                style={{ padding: '5px 10px', fontSize: '13px', borderRadius: '6px' }}
                required
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}>
                Apply Filter
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex gap-2 mb-6 border-b" style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '2px' }}>
        {[
          { id: 'summary', label: 'Combined Summary' },
          { id: 'monthly', label: 'Monthly Financial' },
          { id: 'expenses', label: 'Expense Report' },
          { id: 'savings', label: 'Savings Report' },
          { id: 'notifications', label: 'Latest Notifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              color: activeTab === tab.id ? 'var(--primary-color, #2563eb)' : 'var(--text-muted, #64748b)',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary-color, #2563eb)' : '3px solid transparent',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card p-6 text-center">
          <p className="text-secondary-color" style={{ fontSize: '15px' }}>Loading report data...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="card mb-6 p-4" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* TAB 1: COMBINED SUMMARY */}
          {activeTab === 'summary' && (
            <div>
              <div className="grid-12 mb-6 gap-4">
                <div className="card col-span-4 p-5" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(22, 163, 74, 0.1) 100%)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: '#15803d', textTransform: 'uppercase' }}>Total Income</h4>
                  <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#16a34a' }}>+${(fin.total_income || 0).toFixed(2)}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Income received</span>
                </div>

                <div className="card col-span-4 p-5" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: '#b91c1c', textTransform: 'uppercase' }}>Total Expense</h4>
                  <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#dc2626' }}>-${(fin.total_expense || 0).toFixed(2)}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Expenses recorded</span>
                </div>

                <div className="card col-span-4 p-5" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: '#1d4ed8', textTransform: 'uppercase' }}>Current Balance</h4>
                  <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: fin.current_balance >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${(fin.current_balance || 0).toFixed(2)}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Income − Expense</span>
                </div>

                <div className="card col-span-4 p-5" style={{ borderRadius: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Budget</h4>
                  <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#9333ea' }}>${(fin.total_budget || 0).toFixed(2)}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Budget allocated</span>
                </div>

                <div className="card col-span-4 p-5" style={{ borderRadius: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining Budget</h4>
                  <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: fin.remaining_budget >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${(fin.remaining_budget || 0).toFixed(2)}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Budget − Expense</span>
                </div>

                <div className="card col-span-4 p-5" style={{ borderRadius: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Savings</h4>
                  <p className="font-bold m-0 mt-2" style={{ fontSize: '24px', color: '#0284c7' }}>${(fin.total_savings || 0).toFixed(2)}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Saved in goals</span>
                </div>
              </div>

              {expSummary.category_breakdown && expSummary.category_breakdown.length > 0 && (
                <div className="card mb-6 p-5" style={{ borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Expense Summary by Category</h3>
                  <div className="d-flex flex-column gap-3">
                    {expSummary.category_breakdown.map((cat, idx) => (
                      <div key={idx}>
                        <div className="d-flex justify-between align-center mb-1" style={{ fontSize: '13px' }}>
                          <span className="font-semibold">{cat.category}</span>
                          <span>${cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, cat.percentage)}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MONTHLY FINANCIAL REPORT */}
          {activeTab === 'monthly' && (
            <div className="card p-6" style={{ borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Monthly Financial Report Overview</h3>
              <div className="grid-12 gap-4">
                <div className="col-span-6 card p-4" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Total Income</p>
                  <h2 style={{ margin: '8px 0 0 0', color: '#16a34a' }}>+${(monthlyData?.total_income || 0).toFixed(2)}</h2>
                </div>
                <div className="col-span-6 card p-4" style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Total Expense</p>
                  <h2 style={{ margin: '8px 0 0 0', color: '#dc2626' }}>-${(monthlyData?.total_expense || 0).toFixed(2)}</h2>
                </div>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-color, #e2e8f0)', margin: '20px 0' }} />

              <div className="grid-12 gap-4">
                <div className="col-span-4 p-4" style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: '10px', borderLeft: '4px solid #2563eb' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: '#1d4ed8' }}>Current Balance</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: (monthlyData?.current_balance || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${(monthlyData?.current_balance || 0).toFixed(2)}
                  </h3>
                </div>

                <div className="col-span-4 p-4" style={{ backgroundColor: 'rgba(147, 51, 234, 0.08)', borderRadius: '10px', borderLeft: '4px solid #9333ea' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: '#7e22ce' }}>Total Budget</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: '#9333ea' }}>
                    ${(monthlyData?.total_budget || 0).toFixed(2)}
                  </h3>
                </div>

                <div className="col-span-4 p-4" style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: '#0369a1' }}>Remaining Budget</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', color: (monthlyData?.remaining_budget || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${(monthlyData?.remaining_budget || 0).toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPENSE REPORT TABLE */}
          {activeTab === 'expenses' && (
            <div className="card p-6" style={{ borderRadius: '12px' }}>
              <div className="d-flex justify-between align-center mb-4">
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Detailed Expense Report</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Entries: {expensesData.length}</span>
              </div>

              {expensesData.length === 0 ? (
                <p className="text-secondary-color" style={{ fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  No expense records found.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>Date</th>
                        <th style={{ padding: '10px 12px' }}>Expense Title</th>
                        <th style={{ padding: '10px 12px' }}>Category</th>
                        <th style={{ padding: '10px 12px' }}>Description</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesData.map((exp, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                          <td style={{ padding: '12px' }}>{exp.date || exp.expense_date}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{exp.expense_title || exp.title}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '11px', fontWeight: '600' }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{exp.description || '—'}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>
                            -${parseFloat(exp.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVINGS REPORT */}
          {activeTab === 'savings' && (
            <div className="card p-6" style={{ borderRadius: '12px' }}>
              <div className="d-flex justify-between align-center mb-4">
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Savings Goals Report</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Goals: {savingsData.length}</span>
              </div>

              {savingsData.length === 0 ? (
                <p className="text-secondary-color" style={{ fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  No savings goals created yet.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>Goal Name</th>
                        <th style={{ padding: '10px 12px' }}>Target Amount</th>
                        <th style={{ padding: '10px 12px' }}>Saved Amount</th>
                        <th style={{ padding: '10px 12px' }}>Remaining Amount</th>
                        <th style={{ padding: '10px 12px' }}>Progress</th>
                        <th style={{ padding: '10px 12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savingsData.map((goal, idx) => {
                        const target = parseFloat(goal.target_amount || 0);
                        const saved = parseFloat(goal.saved_amount || 0);
                        const remaining = goal.remaining_amount !== undefined ? parseFloat(goal.remaining_amount) : Math.max(0, target - saved);
                        const progress = goal.progress_percentage !== undefined ? parseFloat(goal.progress_percentage) : (target > 0 ? (saved / target * 100) : 0);

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{goal.goal_name}</td>
                            <td style={{ padding: '12px' }}>${target.toFixed(2)}</td>
                            <td style={{ padding: '12px', color: '#16a34a', fontWeight: '600' }}>${saved.toFixed(2)}</td>
                            <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>${remaining.toFixed(2)}</td>
                            <td style={{ padding: '12px', minWidth: '140px' }}>
                              <div className="d-flex align-center gap-2">
                                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-color, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', backgroundColor: '#22c55e' }} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '600', minWidth: '36px' }}>{progress.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: goal.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' : goal.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                color: goal.status === 'COMPLETED' ? '#16a34a' : goal.status === 'CANCELLED' ? '#dc2626' : '#2563eb'
                              }}>
                                {goal.status || goal.goal_status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LATEST NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="card p-6" style={{ borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Latest System Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-secondary-color" style={{ fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  No notifications recorded.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4"
                      style={{
                        backgroundColor: 'var(--bg-tertiary, #f8fafc)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${n.priority === 'HIGH' ? '#ef4444' : n.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}`
                      }}
                    >
                      <div className="d-flex justify-between align-center mb-1">
                        <strong style={{ fontSize: '14px' }}>{n.title}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
