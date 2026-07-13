import React from 'react';

const Reports = () => {
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">View your financial summaries and monthly reports.</p>
      </header>
      
      <div className="card">
        <h3 className="mb-4">Financial Reports Placeholder</h3>
        <p className="text-secondary-color mb-6">Financial breakdown reports and charts will be rendered here.</p>
        <div style={{ padding: '32px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-base)', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
          Monthly Report Analysis
        </div>
      </div>
    </div>
  );
};

export default Reports;
