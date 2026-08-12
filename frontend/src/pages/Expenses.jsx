import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0.00);
  const [loading, setLoading] = useState(true);
  const [expenseDate, setExpenseDate] = useState('');

  // Filter state
  const [filterMode, setFilterMode] = useState('all'); // 'monthly' | 'all' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [editExpenseDate, setEditExpenseDate] = useState('');

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

  const fetchExpenses = async (extraParams = {}) => {
    try {
      setLoading(true);
      const params = { ...extraParams };
      if (filterMode === 'monthly') {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (filterMode === 'all') {
        params.all_time = true;
      } else if (filterMode === 'custom') {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }
      if (search) params.search = search;
      if (sortOrder) params.sort = sortOrder;

      const res = await api.get('expenses/', { params });
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

    // Check for missing required fields
    if (!title || !amount) {
      alert('Please fill out all required fields.');
      return;
    }

    // Specific check for zero or negative amounts
    if (parseFloat(amount) <= 0) {
      alert("Amount can't be negative or zero.");
      return;
    }

    try {
      await api.post('expenses/', {
        title,
        amount: parseFloat(amount),
        category,
        expense_date: expenseDate || undefined,
      });
      setTitle('');
      setAmount('');
      setExpenseDate('');
      fetchExpenses();
    } catch (err) {
      alert('Failed to log expense item.');
    }
  };

  const handleSaveUpdate = async (id) => {
    // Check for missing values during edit
    if (!editTitle || !editAmount) {
      alert('Please provide all required fields.');
      return;
    }

    // Check for zero or negative amounts during edit
    if (parseFloat(editAmount) <= 0) {
      alert("Amount can't be negative or zero.");
      return;
    }

    try {
      await api.patch(`expenses/${id}/`, {
        title: editTitle,
        amount: parseFloat(editAmount),
        category: editCategory,
        expense_date: editExpenseDate || undefined,
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

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    color: '#2c3e50',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    colorScheme: 'light', // Ensures datepicker icon and popup render with dark/visible controls
  };

  return (
    <MainLayout pageTitle="Expense Management ">
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', alignItems: 'center' }}>
        <input placeholder="Search description..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: '220px' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, width: '160px' }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
          <option value="all">All Time</option>
          <option value="monthly">Monthly</option>
        </select>
        {filterMode === 'monthly' && (
          <input type="month" value={`${selectedYear}-${String(selectedMonth).padStart(2,'0')}`} onChange={(e) => {
            const [y, m] = e.target.value.split('-'); setSelectedYear(parseInt(y)); setSelectedMonth(parseInt(m));
          }} style={{ ...inputStyle, width: '160px' }} />
        )}
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
        <button onClick={() => fetchExpenses()} style={{ padding: '10px 14px', borderRadius: '10px', background: '#38b6ff', color: 'white', border: 'none', cursor: 'pointer' }}>Apply</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', fontFamily: 'sans-serif' }}>
        
        {/* Total Expenses Card with Warm Red Gradient */}
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, #ff3d1f, #ff8168)', 
            color: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: '0 8px 20px rgba(255, 75, 31, 0.25)', 
            textAlign: 'center' 
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: 'bold' }}>
              Total Expenses
            </p>
            <h1 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', fontWeight: '800' }}>
              ₹{totalExpenses.toFixed(2)}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Add Form Panel */}
          <div style={{ 
            flex: '1', 
            minWidth: '300px', 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)' 
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              📝 Log an Expense
            </h3>
            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>
                  Item / Description
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Groceries" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>
                  Amount (₹)
                </label>
                <input 
                  type="number" 
                  placeholder="e.g. 250" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>
                  Category
                </label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                >
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>
                  Expense Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  padding: '14px', 
                  background: 'linear-gradient(135deg, #ff1f1f, #ff7068)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 75, 31, 0.3)',
                  marginTop: '8px'
                }}
              >
                Log Item
              </button>
            </form>
          </div>

          {/* Logs List View */}
          <div style={{ 
            flex: '2', 
            minWidth: '340px', 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)' 
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              📋 Expense History
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ff2a1f', fontWeight: 'bold' }}>
                ✨ Loading records...
              </div>
            ) : expenses.length === 0 ? (
              <p style={{ color: '#95a5a6', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                No logged expenses found.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expenses.map((e) => (
                  <div 
                    key={e.id} 
                    style={{ 
                      borderLeft: '5px solid #ff4b1f', 
                      background: '#f8fafc', 
                      padding: '16px 20px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)' 
                    }}
                  >
                    {editingId === e.id ? (
                      /* Editing Mode Form Row */
                      <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '120px', padding: '8px 10px' }} />
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} style={{ ...inputStyle, width: '100px', padding: '8px 10px' }} />
                        <input type="date" value={editExpenseDate} onChange={(e) => setEditExpenseDate(e.target.value)} style={{ ...inputStyle, width: '140px', padding: '8px 10px' }} />
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ ...inputStyle, width: '130px', padding: '8px 10px' }}>
                          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button onClick={() => handleSaveUpdate(e.id)} style={{ background: '#ff4b1f', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: '#cbd5e1', color: '#475569', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      /* Display Row Mode */
                      <>
                        <div>
                          <h4 style={{ margin: '0 0 6px 0', color: '#2c3e50', fontSize: '1.05rem', fontWeight: 'bold' }}>
                            {e.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              background: '#fee2e2', 
                              color: '#991b1b', 
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              fontWeight: '600' 
                            }}>
                              {e.category}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                              {e.expense_date ? new Date(e.expense_date).toLocaleDateString() : (e.created_at ? new Date(e.created_at).toLocaleDateString() : '')}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                          <h3 style={{ margin: 0, color: '#e11d48', fontWeight: '800', fontSize: '1.25rem' }}>
                            - ₹{parseFloat(e.amount).toFixed(2)}
                          </h3>
                          
                          {/* Control Action Tools Buttons */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span 
                              onClick={() => {
                                setEditingId(e.id);
                                setEditTitle(e.title);
                                setEditAmount(e.amount);
                                setEditCategory(e.category);
                                setEditExpenseDate(e.expense_date || e.created_at || '');
                              }} 
                              style={{ cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }} 
                              title="Edit Item"
                            >
                              ✏️
                            </span>
                            <span 
                              onClick={() => handleDeleteExpense(e.id)} 
                              style={{ cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }} 
                              title="Delete Item"
                            >
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