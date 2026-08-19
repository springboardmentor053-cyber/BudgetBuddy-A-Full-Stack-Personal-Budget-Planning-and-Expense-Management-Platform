import React, { useState } from 'react';
import API from '../api';

const Reports = () => {
  const [filterType, setFilterType] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [message, setMessage] = useState('');

  const getQueryParams = () => {
    let params = `filter_type=${filterType}`;
    if (filterType === 'custom' && startDate && endDate) {
      params += `&start_date=${startDate}&end_date=${endDate}`;
    }
    return params;
  };

  // Download PDF Report
  const handleDownloadPDF = async () => {
    try {
      const response = await API.get(`reports/export-pdf/?${getQueryParams()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Financial_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF report:', err);
    }
  };

  // Send PDF via Email Notification
  const handleEmailPDF = async () => {
    setLoadingEmail(true);
    setMessage('');
    try {
      const response = await API.post(`reports/email-pdf/?${getQueryParams()}`);
      setMessage(response.data.message);
    } catch (err) {
      console.error('Error emailing PDF report:', err);
      setMessage(err.response?.data?.error || 'Failed to email PDF report.');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="card" style={{ padding: '20px', color: '#fff' }}>
      <h3 className="card-title">Financial Reports & PDF Export</h3>

      {/* Date Filter Controls (Task 6) */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '15px 0', flexWrap: 'wrap' }}>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px', background: '#334155', color: '#fff', borderRadius: '4px', border: 'none' }}
        >
          <option value="current_month">Current Month</option>
          <option value="previous_month">Previous Month</option>
          <option value="custom">Custom Date Range</option>
        </select>

        {filterType === 'custom' && (
          <>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px', background: '#334155', color: '#fff', borderRadius: '4px', border: 'none' }}
            />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px', background: '#334155', color: '#fff', borderRadius: '4px', border: 'none' }}
            />
          </>
        )}
      </div>

      {/* Export & Email Buttons (Task 7 & Email Notification) */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button 
          onClick={handleDownloadPDF} 
          style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          📄 Download PDF Report
        </button>

        <button 
          onClick={handleEmailPDF} 
          disabled={loadingEmail}
          style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loadingEmail ? 'Sending Email...' : '✉️ Email Report as PDF'}
        </button>
      </div>

      {message && <p style={{ marginTop: '15px', color: '#00e676', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default Reports;