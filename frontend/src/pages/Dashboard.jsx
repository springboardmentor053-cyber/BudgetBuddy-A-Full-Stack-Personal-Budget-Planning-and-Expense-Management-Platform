import React from 'react';
import MainLayout from '../layouts/MainLayout';

function Dashboard() {
  return (
    <MainLayout pageTitle="Financial Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#2ecc71', color: 'white', padding: '20px', borderRadius: '8px' }}><h3>Total Income</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>$0.00</p></div>
        <div style={{ background: '#e74c3c', color: 'white', padding: '20px', borderRadius: '8px' }}><h3>Total Expenses</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>$0.00</p></div>
        <div style={{ background: '#3498db', color: 'white', padding: '20px', borderRadius: '8px' }}><h3>Remaining Budget</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>$0.00</p></div>
      </div>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Recent Transactions</h3>
        <p style={{ color: '#7f8c8d' }}>No transaction history available yet.</p>
      </div>
    </MainLayout>
  );
}
export default Dashboard;