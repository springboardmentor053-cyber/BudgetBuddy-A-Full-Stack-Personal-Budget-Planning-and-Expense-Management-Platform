import React from 'react';
import MainLayout from '../layouts/MainLayout';

function Budgets() {
  return (
    <MainLayout pageTitle="Monthly Budget Planning">
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Set Category Budgets</h3>
        <p style={{ color: '#7f8c8d' }}>Define spending thresholds to prevent overspending alerts.</p>
      </div>
    </MainLayout>
  );
}
export default Budgets;