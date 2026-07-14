import React from 'react';
import MainLayout from '../layouts/MainLayout';

function Income() {
  return (
    <MainLayout pageTitle="Income Tracking">
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Add New Income Stream</h3>
        <form style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <input type="text" placeholder="Source (e.g. Salary, Pocket Money)" style={{ padding: '10px', flex: 2 }} />
          <input type="number" placeholder="Amount" style={{ padding: '10px', flex: 1 }} />
          <input type="date" style={{ padding: '10px', flex: 1 }} />
          <button type="button" style={{ padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
        </form>
      </div>
    </MainLayout>
  );
}
export default Income;