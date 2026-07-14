import React from 'react';
import MainLayout from '../layouts/MainLayout';

function Reports() {
  return (
    <MainLayout pageTitle="Financial Reports & Analytics">
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Export Statements</h3>
        <button style={{ padding: '10px 20px', background: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download CSV Statement</button>
      </div>
    </MainLayout>
  );
}
export default Reports;