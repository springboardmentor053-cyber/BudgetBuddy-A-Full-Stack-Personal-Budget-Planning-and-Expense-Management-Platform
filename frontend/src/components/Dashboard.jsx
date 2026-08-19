import React, { useState, useEffect } from 'react';
import API from '../api';
import { Wallet, CreditCard, PiggyBank } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await API.get('summary/');
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{color:'white '}}>Financial Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Total Income Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#00e67622', padding: '15px', borderRadius: '12px' }}>
            <Wallet size={32} color="#00e676" />
          </div>
          <div>
            <span style={{ color: '#8c93a8', fontSize: '0.85rem' }}>TOTAL INCOME</span>
            <h3 style={{ color: '#00e676', fontSize: '1.5rem', marginTop: '4px' }}>₹{summary.total_income.toFixed(2)}</h3>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#ff3b6b22', padding: '15px', borderRadius: '12px' }}>
            <CreditCard size={32} color="#ff3b6b" />
          </div>
          <div>
            <span style={{ color: '#8c93a8', fontSize: '0.85rem' }}>TOTAL EXPENSES</span>
            <h3 style={{ color: '#ff3b6b', fontSize: '1.5rem', marginTop: '4px' }}>₹{summary.total_expense.toFixed(2)}</h3>
          </div>
        </div>

        {/* Current Balance Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#3b82f622', padding: '15px', borderRadius: '12px' }}>
            <PiggyBank size={32} color="#3b82f6" />
          </div>
          <div>
            <span style={{ color: '#8c93a8', fontSize: '0.85rem' }}>NET BALANCE</span>
            <h3 style={{ color: summary.current_balance >= 0 ? '#3b82f6' : '#ff3b6b', fontSize: '1.5rem', marginTop: '4px' }}>
              ₹{summary.current_balance.toFixed(2)}
            </h3>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;