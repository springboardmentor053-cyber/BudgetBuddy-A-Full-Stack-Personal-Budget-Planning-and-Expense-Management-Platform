import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Income() {
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0.00);
  const [loading, setLoading] = useState(true);

  // Form Field State (Removed separate title state)
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('SALARY');
  const [incomeDate, setIncomeDate] = useState('');

  // Editing State Configurations
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');

  const incomeCategories = [
    { value: 'SALARY', label: 'Salary ' },
    { value: 'FREELANCING', label: 'Freelancing ' },
    { value: 'POCKET_MONEY', label: 'Pocket Money ' },
    { value: 'INVESTMENTS', label: 'Investments ' },
    { value: 'OTHER', label: 'Other Sources ' },
  ];

  // Helper to find display label from database value
  const getCategoryLabel = (val) => {
    const found = incomeCategories.find(c => c.value === val);
    return found ? found.label : val;
  };

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await api.get('income/');
      const incomeList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setIncomes(incomeList);

      const total = incomeList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      setTotalIncome(total);
    } catch (err) {
      console.error('Error fetching income tracking lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    if (!amount || !incomeDate || parseFloat(amount) <= 0) {
      alert('Please fill out all fields with valid data values.');
      return;
    }

    // Find the readable label to use as the title string
    const targetLabel = incomeCategories.find(c => c.value === category)?.label || category;

    try {
      await api.post('income/', {
        title: targetLabel, // Automatically set title from category selection
        amount: parseFloat(amount),
        category,
        income_date: incomeDate
      });
      setAmount('');
      setIncomeDate('');
      fetchIncomes();
    } catch (err) {
      alert('Failed to log new income source.');
    }
  };

  const handleSaveUpdate = async (id) => {
    if (!editAmount || !editDate || parseFloat(editAmount) <= 0) {
      alert('Please provide valid updated values.');
      return;
    }

    const targetLabel = incomeCategories.find(c => c.value === editCategory)?.label || editCategory;

    try {
      await api.patch(`income/${id}/`, {
        title: targetLabel, // Automatically sync title on update
        amount: parseFloat(editAmount),
        category: editCategory,
        income_date: editDate
      });
      setEditingId(null);
      fetchIncomes();
    } catch (err) {
      alert('Failed to update income transaction item.');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Erase this income transaction record permanently?')) {
      try {
        await api.delete(`income/${id}/`);
        fetchIncomes();
      } catch (err) {
        alert('Failed to remove entry item.');
      }
    }
  };

  return (
    <MainLayout pageTitle="Income Tracking">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
        
        {/* Total Income Metric Display Card */}
        <div style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 5px 0', fontWeight: 'normal' }}>Total Income</h3>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>₹{totalIncome.toFixed(2)}</h1>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Create Left Form Panel Block */}
          <div style={{ flex: '1', minWidth: '300px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Add New Income Stream</h3>
            <form onSubmit={handleCreateIncome} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #dcdde1', background: '#2f3640', color: 'white' }}
              >
                {incomeCategories.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
              </select>
              <input 
                type="number" 
                placeholder="Amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #dcdde1', background: '#2f3640', color: 'white' }}
              />
              <input 
                type="date" 
                value={incomeDate} 
                onChange={(e) => setIncomeDate(e.target.value)}
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #dcdde1', background: '#2f3640', color: 'white' }}
              />
              <button type="submit" style={{ padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Save
              </button>
            </form>
          </div>

          {/* Right Log Item History Results Panel Block */}
          <div style={{ flex: '2', minWidth: '400px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Income Logs History</h3>
            
            {loading ? (
              <p>Fetching statement balances...</p>
            ) : incomes.length === 0 ? (
              <p style={{ color: '#95a5a6', fontStyle: 'italic', textAlign: 'center' }}>No recent income logs recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {incomes.map((inc) => (
                  <div key={inc.id} style={{ borderLeft: '5px solid #2ecc71', background: '#f8f9fa', padding: '15px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {editingId === inc.id ? (
                      /* Editing Form View layout */
                      <div style={{ display: 'flex', gap: '10px', width: '80%', flexWrap: 'wrap' }}>
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} style={{ padding: '5px', width: '90px' }} />
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} style={{ padding: '5px' }} />
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ padding: '5px' }}>
                          {incomeCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button onClick={() => handleSaveUpdate(inc.id)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: '#7f8c8d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>X</button>
                      </div>
                    ) : (
                      /* Regular Entry layout Row format display block */
                      <>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.2rem' }}>
                            {inc.title || getCategoryLabel(inc.category)}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                            Date: {inc.income_date}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <h2 style={{ margin: 0, color: '#2ecc71' }}>+ ₹{parseFloat(inc.amount).toFixed(2)}</h2>
                          
                          {/* Action Controls elements */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span 
                              onClick={() => {
                                setEditingId(inc.id);
                                setEditAmount(inc.amount);
                                setEditCategory(inc.category);
                                setEditDate(inc.income_date);
                              }} 
                              style={{ cursor: 'pointer', fontSize: '1.2rem' }} 
                              title="Edit Item"
                            >
                              ✏️
                            </span>
                            <span onClick={() => handleDeleteIncome(inc.id)} style={{ cursor: 'pointer', fontSize: '1.2rem' }} title="Delete Item">
                              🗑️
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default Income;