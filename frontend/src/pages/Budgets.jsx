import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('FOOD');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month (1-12)
  const [year, setYear] = useState(2026); // Default matching target project year

  // View Filter State (Defaults to current month/year)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  // Dropdown options matching the expense categories exactly
  const categories = [
    { value: 'FOOD', label: 'Food 🍔' },
    { value: 'TRAVEL', label: 'Travel ✈️' },
    { value: 'SHOPPING', label: 'Shopping 🛍️' },
    { value: 'EDUCATION', label: 'Education 📚' },
    { value: 'ENTERTAINMENT', label: 'Entertainment 🎬' },
    { value: 'HEALTHCARE', label: 'Healthcare 🏥' },
    { value: 'BILLS', label: 'Bills 🏠' },
    { value: 'MISCELLANEOUS', label: 'Miscellaneous 🪙' },
  ];

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Safely fetch budgets handling both standard arrays and DRF paginated arrays
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('budgets/');
      
      const budgetList = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.results || []);
        
      setBudgets(budgetList);
    } catch (err) {
      console.error('Error retrieving budget layouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // CREATE Budget matching exact backend column field names
  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please provide a valid budget target amount!');
      return;
    }

    try {
      await api.post('budgets/', {
        category,
        budget_amount: parseFloat(amount),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      });
      
      // Auto switch the list filter to match the newly added budget's month & year
      setSelectedMonth(parseInt(month, 10));
      setSelectedYear(parseInt(year, 10));
      
      setAmount('');
      fetchBudgets();
    } catch (err) {
      const errorData = err.response?.data;
      console.error("Backend validation or database error details:", errorData);
      
      let errorMsg = 'Failed to save budget.';
      
      if (errorData) {
        if (typeof errorData === 'object') {
          errorMsg = Object.entries(errorData)
            .map(([field, msgs]) => {
              const cleanedMsgs = Array.isArray(msgs) ? msgs.join(', ') : JSON.stringify(msgs);
              return `${field}: ${cleanedMsgs}`;
            })
            .join('\n');
        } else {
          errorMsg = String(errorData);
        }
      } else {
        errorMsg = err.message || errorMsg;
      }

      alert(errorMsg);
    }
  };

  // UPDATE Budget Limit
  const handleSaveUpdate = async (id) => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      alert('Please input a positive non-zero value!');
      return;
    }

    try {
      await api.patch(`budgets/${id}/`, {
        budget_amount: parseFloat(editAmount),
      });
      setEditingId(null);
      setEditAmount('');
      fetchBudgets();
    } catch (err) {
      alert('Error updating budget limit.');
    }
  };

  // DELETE Budget
  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to completely erase this category budget?')) {
      try {
        await api.delete(`budgets/${id}/`);
        fetchBudgets();
      } catch (err) {
        alert('Failed to erase selected budget.');
      }
    }
  };

  // Filter budgets dynamically based on month & year selectors
  const filteredBudgets = budgets.filter((b) => {
    return parseInt(b.month, 10) === parseInt(selectedMonth, 10) &&
           parseInt(b.year, 10) === parseInt(selectedYear, 10);
  });

  return (
    <MainLayout pageTitle="Monthly Budget Planning">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
        
        {/* Set Budget Form Card */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0', fontSize: '1.3rem' }}>Set Category Budget</h3>
          
          <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            {/* Category Dropdown */}
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', outline: 'none' }}
              >
                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
            </div>

            {/* Budget Target Limit */}
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Budget Limit (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 5000"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', boxSizing: 'border-box' }}
              />
            </div>

            {/* Target Month */}
            <div style={{ width: '130px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Month</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1' }}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Target Year */}
            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value, 10) || '')}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', boxSizing: 'border-box' }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}
            >
              Add Budget
            </button>
          </form>
        </div>

        {/* List of Budgets with Month Filter Controls */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          
          {/* Header Row with Filter Dropdowns */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h3 style={{ color: '#2c3e50', margin: 0, fontSize: '1.3rem' }}>Active Trackers</h3>
            
            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e1e8ed' }}>
              <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>Filter View:</span>
              
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #dcdde1', fontSize: '0.85rem', fontWeight: '600', color: '#2c3e50', background: 'white' }}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>

              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #dcdde1', fontSize: '0.85rem', fontWeight: '600', color: '#2c3e50', background: 'white' }}
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Retrieving live budget progress summary...</p>
          ) : filteredBudgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ color: '#95a5a6', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                No active budgets found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
              </p>
              <button 
                onClick={() => {
                  setMonth(selectedMonth);
                  setYear(selectedYear);
                }} 
                style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                Set a budget for this month
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredBudgets.map((b) => {
                const budgetLimit = parseFloat(b.budget_amount) || 0; 
                const totalSpent = parseFloat(b.current_amount) || 0; 
                const percent = budgetLimit > 0 ? Math.min((totalSpent / budgetLimit) * 100, 100) : 0;
                const isOverspent = totalSpent > budgetLimit;
                const remaining = Math.max(0, budgetLimit - totalSpent);
                const overspentAmount = Math.max(0, totalSpent - budgetLimit);

                return (
                  <div 
                    key={b.id} 
                    style={{ 
                      borderRadius: '8px', 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      background: isOverspent ? '#fff5f5' : '#ffffff',
                      border: isOverspent ? '1.5px solid #fecaca' : '1px solid #e1e8ed', 
                      boxShadow: isOverspent ? '0 4px 12px rgba(239, 68, 68, 0.12)' : '0 2px 5px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      {/* Card Header Category + Date Block */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: isOverspent ? '#b91c1c' : '#2c3e50', fontSize: '1.15rem', fontWeight: '700' }}>
                            {categories.find(c => c.value === b.category)?.label || b.category}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: isOverspent ? '#ef4444' : '#7f8c8d', fontWeight: '500' }}>
                            {months.find(m => m.value === parseInt(b.month, 10))?.label} {b.year}
                          </span>
                        </div>
                        
                        {/* Status Warning Badges */}
                        {isOverspent ? (
                          <span style={{ background: '#dc2626', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)' }}>
                            Overspent! ⚠️
                          </span>
                        ) : (
                          <span style={{ background: '#3498db', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            On Track
                          </span>
                        )}
                      </div>

                      {/* Visual Spending Progress bar */}
                      <div style={{ width: '100%', height: '10px', background: isOverspent ? '#fee2e2' : '#ecf0f1', borderRadius: '5px', margin: '15px 0 10px 0', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: isOverspent ? '#dc2626' : '#3498db', transition: 'width 0.4s ease' }} />
                      </div>

                      {/* Summary Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: '#34495e', margin: '10px 0' }}>
                        <div>
                          <strong style={{ color: isOverspent ? '#991b1b' : '#34495e' }}>Spent:</strong> ₹{totalSpent.toFixed(2)}
                        </div>
                        <div>
                          <strong style={{ color: isOverspent ? '#991b1b' : '#34495e' }}>Target Limit:</strong> ₹{budgetLimit.toFixed(2)}
                        </div>
                        {isOverspent ? (
                          <div style={{ gridColumn: 'span 2', color: '#b91c1c', fontSize: '0.9rem', marginTop: '4px' }}>
                            <strong>Over Limit By:</strong> ₹{overspentAmount.toFixed(2)}
                          </div>
                        ) : (
                          <div style={{ gridColumn: 'span 2', color: '#3498db' }}>
                            <strong>Available Remaining:</strong> ₹{remaining.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline edit and delete buttons footer */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: isOverspent ? '1px solid #fca5a5' : '1px solid #f1f2f6', paddingTop: '15px', justifyContent: 'flex-end' }}>
                      {editingId === b.id ? (
                        <>
                          <input 
                            type="number" 
                            value={editAmount} 
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="New limit"
                            style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccd1d9', fontSize: '0.85rem' }}
                          />
                          <button onClick={() => handleSaveUpdate(b.id)} style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              setEditingId(b.id);
                              setEditAmount(b.budget_amount);
                            }}
                            style={{ padding: '6px 12px', background: '#f1c40f', color: '#2c3e50', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBudget(b.id)}
                            style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

export default Budgets;