import React from 'react';
import MainLayout from '../layouts/MainLayout';

function Settings() {
  return (
    <MainLayout pageTitle="Account Settings">
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Profile Adjustments</h3>
        <p style={{ color: '#7f8c8d' }}>Manage passwords and notification limits here.</p>
      </div>
    </MainLayout>
  );
}
export default Settings;