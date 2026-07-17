import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Dashboard() {
  const [summary, setSummary] = useState({
    total_income: 0.0,
    total_expense: 0.0,
    current_balance: 0.0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch financial summary cards data
        const summaryResponse = await api.get('summary/');
        setSummary(summaryResponse.data);

        // 2. Fetch income and expense lists concurrently to build the recent feed
        const [incomeRes, expenseRes] = await Promise.all([
          api.get('income/'),
          api.get('expenses/')
        ]);

        // Tag each item so we know how to style it
        const taggedIncomes = (incomeRes.data || []).map(item => ({
          ...item,
          type: 'income',
          displayDate: item.income_date,
          amountValue: parseFloat(item.amount)
        }));

        const taggedExpenses = (expenseRes.data || []).map(item => ({
          ...item,
          type: 'expense',
          // Adjust 'created_at' or 'expense_date' depending on your backend key name
          displayDate: item.expense_date || item.created_at?.split('T')[0] || '', 
          amountValue: parseFloat(item.amount)
        }));

        // 3. Combine and sort by date descending (newest first)
        const combined = [...taggedIncomes, ...taggedExpenses].sort((a, b) => {
          return new Date(b.displayDate) - new Date(a.displayDate);
        });

        // Take only the top 5 most recent transactions
        setTransactions(combined.slice(0, 5));

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardContainerStyle = {
    display: 'flex',
    gap: '20px',
    width: '100%',
    marginBottom: '30px',
  };

  const cardStyle = (bgColor) => ({
    flex: 1,
    background: bgColor,
    color: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  });

  return (
    <MainLayout pageTitle="Financial Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Retrieving your financial summary...</p>
        ) : (
          <>
            {/* Top Stat Cards Row */}
            <div style={cardContainerStyle}>
              <div style={cardStyle('#2ecc71')}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>Total Income</h3>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '15px 0 0 0' }}>
                  ₹{parseFloat(summary.total_income).toFixed(2)}
                </p>
              </div>

              <div style={cardStyle('#e74c3c')}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>Total Expenses</h3>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '15px 0 0 0' }}>
                  ₹{parseFloat(summary.total_expense).toFixed(2)}
                </p>
              </div>

              <div style={cardStyle('#3498db')}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>Remaining Budget</h3>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '15px 0 0 0' }}>
                  ₹{parseFloat(summary.current_balance).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Dynamic Recent Transactions Feed Section */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
              <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0', textAlign: 'center', fontSize: '1.4rem' }}>Recent Transactions</h3>
              
              {transactions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#95a5a6', fontStyle: 'italic' }}>
                  Go to the Income or Expenses tab to add, view, or manage your transactions.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {transactions.map((tx, idx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '15px 20px', 
                          background: '#f8f9fa', 
                          borderRadius: '6px', 
                          borderLeft: `5px solid ${isIncome ? '#2ecc71' : '#e74c3c'}` 
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2c3e50' }}>
                            {tx.title}
                          </strong>
                          <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                            Date: {tx.displayDate}
                          </span>
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: isIncome ? '#2ecc71' : '#e74c3c' }}>
                          {isIncome ? '+' : '-'} ₹{tx.amountValue.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </MainLayout>
  );
}

export default Dashboard;