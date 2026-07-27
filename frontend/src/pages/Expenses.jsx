import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0.00);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');

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

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('expenses/');
      const expenseList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setExpenses(expenseList);

      const total = expenseList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      setTotalExpenses(total);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount || parseFloat(amount) <= 0) {
      alert('Please fill out all fields with valid data.');
      return;
    }

    try {
      await api.post('expenses/', {
        title,
        amount: parseFloat(amount),
        category
      });
      setTitle('');
      setAmount('');
      fetchExpenses();
    } catch (err) {
      alert('Failed to log expense item.');
    }
  };

  const handleSaveUpdate = async (id) => {
    if (!editTitle || !editAmount || parseFloat(editAmount) <= 0) {
      alert('Please provide valid updated values.');
      return;
    }

    try {
      await api.patch(`expenses/${id}/`, {
        title: editTitle,
        amount: parseFloat(editAmount),
        category: editCategory
      });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      alert('Failed to update expense item.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense item permanently?')) {
      try {
        await api.delete(`expenses/${id}/`);
        fetchExpenses();
      } catch (err) {
        alert('Failed to delete expense.');
      }
    }
  };

  return (
    <MainLayout pageTitle="Expense Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
        
        {/* Banner */}
        <div style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 5px 0', fontWeight: 'normal' }}>Total Expenses</h3>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>₹{totalExpenses.toFixed(2)}</h1>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Add Form */}
          <div style={{ flex: '1', minWidth: '300px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Log an Expense</h3>
            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Item/Description" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #dcdde1', background: '#2f3640', color: 'white' }}
              />
              <input 
                type="number" 
                placeholder="Amount (₹)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #dcdde1', background: '#2f3640', color: 'white' }}
              />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #dcdde1', background: '#2f3640', color: 'white' }}
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button type="submit" style={{ padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Log Item
              </button>
            </form>
          </div>

          {/* Logs List View */}
          <div style={{ flex: '2', minWidth: '400px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>History</h3>
            
            {loading ? (
              <p>Loading records...</p>
            ) : expenses.length === 0 ? (
              <p style={{ color: '#95a5a6', fontStyle: 'italic' }}>No logged expenses found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {expenses.map((e) => (
                  <div key={e.id} style={{ borderLeft: '5px solid #e74c3c', background: '#f8f9fa', padding: '15px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {editingId === e.id ? (
                      /* Editing Mode Form Row */
                      <div style={{ display: 'flex', gap: '10px', width: '80%', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)} 
                          style={{ padding: '5px', flex: 1 }}
                        />
                        <input 
                          type="number" 
                          value={editAmount} 
                          onChange={(e) => setEditAmount(e.target.value)} 
                          style={{ padding: '5px', width: '90px' }}
                        />
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ padding: '5px' }}>
                          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button onClick={() => handleSaveUpdate(e.id)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: '#7f8c8d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>X</button>
                      </div>
                    ) : (
                      /* Display Row Mode */
                      <>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.2rem' }}>{e.title}</h4>
                          <span style={{ background: '#eaeded', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8rem', color: '#7f8c8d', marginRight: '10px', fontWeight: '500' }}>
                            {e.category}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                            {e.created_at ? new Date(e.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <h2 style={{ margin: 0, color: '#2c3e50' }}>₹{parseFloat(e.amount).toFixed(2)}</h2>
                          
                          {/* Control Action Tools Buttons (Edit + Delete next to each other) */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span 
                              onClick={() => {
                                setEditingId(e.id);
                                setEditTitle(e.title);
                                setEditAmount(e.amount);
                                setEditCategory(e.category);
                              }} 
                              style={{ cursor: 'pointer', fontSize: '1.2rem' }} 
                              title="Edit Item"
                            >
                              ✏️
                            </span>
                            <span onClick={() => handleDeleteExpense(e.id)} style={{ cursor: 'pointer', fontSize: '1.2rem' }} title="Delete Item">
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

export default Expenses;