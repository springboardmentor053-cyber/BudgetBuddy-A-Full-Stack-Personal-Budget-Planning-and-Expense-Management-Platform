import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('FOOD');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default (1-12)
  const [year, setYear] = useState(2026);

  // View Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

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
      
      setSelectedMonth(parseInt(month, 10));
      setSelectedYear(parseInt(year, 10));
      setAmount('');
      await fetchBudgets();
    } catch (err) {
      const errorData = err.response?.data;
      console.error("Backend validation or database error details:", errorData);
      
      let errorMsg = 'Failed to save budget.';
      if (errorData) {
        if (typeof errorData === 'object') {
          errorMsg = Object.entries(errorData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : JSON.stringify(msgs)}`)
            .join('\n');
        } else {
          errorMsg = String(errorData);
        }
      }
      await fetchBudgets();
      alert(`${errorMsg}\n\nIf the budget row appears after this, the save worked and only the response handling failed.`);
    }
  };

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

  // Filtered list based on month/year
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      return parseInt(b.month, 10) === parseInt(selectedMonth, 10) &&
             parseInt(b.year, 10) === parseInt(selectedYear, 10);
    });
  }, [budgets, selectedMonth, selectedYear]);

  // Aggregate totals for top summary cards
  const { totalAllocated, totalSpent, totalRemaining } = useMemo(() => {
    const allocated = filteredBudgets.reduce((acc, b) => acc + (parseFloat(b.budget_amount) || 0), 0);
    const spent = filteredBudgets.reduce((acc, b) => acc + (parseFloat(b.current_amount) || 0), 0);
    const remaining = allocated - spent;
    return {
      totalAllocated: allocated,
      totalSpent: spent,
      totalRemaining: remaining
    };
  }, [filteredBudgets]);

  // Reusable Input Style for set budget form
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <MainLayout pageTitle="Monthly Budget Planning ">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%', fontFamily: 'sans-serif' }}>
        
        {/* TOP GRADIENT SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Total Budget Allocated */}
          <div style={{
            background: 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              TOTAL BUDGET ALLOCATED
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              ₹{totalAllocated.toFixed(2)}
            </div>
          </div>

          {/* Total Spent */}
          <div style={{
            background: 'linear-gradient(135deg, #ff4d4d 0%, #f43f5e 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(244, 63, 94, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              TOTAL SPENT
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              ₹{totalSpent.toFixed(2)}
            </div>
          </div>

          {/* Remaining Budget */}
          <div style={{
            background: totalRemaining < 0 
              ? 'linear-gradient(135deg, #ff4d4d 0%, #dc2626 100%)' 
              : 'linear-gradient(135deg, #ff4081 0%, #ff527b 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(255, 64, 129, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              {totalRemaining < 0 ? 'OVER BUDGET BY' : 'REMAINING BUDGET'}
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              ₹{Math.abs(totalRemaining).toFixed(2)}
            </div>
          </div>

          {/* Active Trackers */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(109, 40, 217, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              ACTIVE CATEGORIES
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {filteredBudgets.length}
            </div>
          </div>

        </div>

        {/* SET BUDGET FORM CARD (DARK SLATE NAVY) */}
        <div style={{ 
          background: '#2b3d4e', 
          padding: '25px', 
          borderRadius: '16px', 
          boxShadow: '0 8px 25px rgba(43, 61, 78, 0.25)' 
        }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700' }}>
             Set Category Budget
          </h3>
          
          <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              >
                {categories.map(cat => <option key={cat.value} value={cat.value} style={{ background: '#ffffff', color: '#0f172a' }}>{cat.label}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Budget Limit (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 5000"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                inputMode="decimal"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 130px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Month</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                style={inputStyle}
              >
                {months.map(m => <option key={m.value} value={m.value} style={{ background: '#ffffff', color: '#0f172a' }}>{m.label}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 110px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value, 10) || '')}
                min="2000"
                max="2100"
                required
                style={inputStyle}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: '10px 24px', 
                background: 'linear-gradient(135deg, #2ecc71 0%, #10b981 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                height: '42px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              Add Budget
            </button>
          </form>
        </div>

        {/* LIST OF BUDGETS WITH FILTER */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h3 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Active Trackers</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '6px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>Filter View:</span>
              
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600', color: '#334155', background: 'white' }}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>

              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600', color: '#334155', background: 'white' }}
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>Retrieving live budget progress summary...</p>
          ) : filteredBudgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                No active budgets found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
              </p>
              <button 
                onClick={() => {
                  setMonth(selectedMonth);
                  setYear(selectedYear);
                }} 
                style={{ background: 'none', border: 'none', color: '#38b6ff', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'underline' }}
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
                      borderRadius: '14px', 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      background: isOverspent ? '#fff5f5' : '#ffffff',
                      border: isOverspent ? '1.5px solid #fecaca' : '1px solid #e2e8f0', 
                      boxShadow: isOverspent ? '0 4px 12px rgba(239, 68, 68, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: isOverspent ? '#b91c1c' : '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
                            {categories.find(c => c.value === b.category)?.label || b.category}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: isOverspent ? '#ef4444' : '#64748b', fontWeight: '500' }}>
                            {months.find(m => m.value === parseInt(b.month, 10))?.label} {b.year}
                          </span>
                        </div>
                        
                        {isOverspent ? (
                          <span style={{ background: '#dc2626', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>
                            Overspent! ⚠️
                          </span>
                        ) : (
                          <span style={{ background: '#2ecc71', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>
                            On Track
                          </span>
                        )}
                      </div>

                      {/* Visual Progress Bar */}
                      <div style={{ width: '100%', height: '10px', background: isOverspent ? '#fee2e2' : '#f1f5f9', borderRadius: '5px', margin: '15px 0 10px 0', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percent}%`, 
                          height: '100%', 
                          background: isOverspent ? 'linear-gradient(90deg, #ff4d4d 0%, #dc2626 100%)' : 'linear-gradient(90deg, #38b6ff 0%, #0284c7 100%)', 
                          transition: 'width 0.4s ease' 
                        }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: '#334155', margin: '12px 0' }}>
                        <div>
                          <strong>Spent:</strong> ₹{totalSpent.toFixed(2)}
                        </div>
                        <div>
                          <strong>Limit:</strong> ₹{budgetLimit.toFixed(2)}
                        </div>
                        {isOverspent ? (
                          <div style={{ gridColumn: 'span 2', color: '#b91c1c', fontSize: '0.88rem', fontWeight: '700', marginTop: '4px' }}>
                            Over Limit By: ₹{overspentAmount.toFixed(2)}
                          </div>
                        ) : (
                          <div style={{ gridColumn: 'span 2', color: '#0284c7', fontSize: '0.88rem', fontWeight: '700', marginTop: '4px' }}>
                            Remaining: ₹{remaining.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: isOverspent ? '1px solid #fca5a5' : '1px solid #f1f5f9', paddingTop: '15px', justifyContent: 'flex-end' }}>
                      {editingId === b.id ? (
                        <>
                          <input 
                            type="number" 
                            value={editAmount} 
                            onChange={(e) => setEditAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="New limit"
                            style={{ width: '100px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                          />
                          <button onClick={() => handleSaveUpdate(b.id)} style={{ padding: '6px 12px', background: '#38b6ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
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
                            style={{ padding: '6px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBudget(b.id)}
                            style={{ padding: '6px 14px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}
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
