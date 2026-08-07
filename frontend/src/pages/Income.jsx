import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Income() {
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0.00);
  const [loading, setLoading] = useState(true);

  // Form Field State
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('SALARY');
  const [incomeDate, setIncomeDate] = useState('');

  // Editing State Configurations
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editDate, setEditDate] = useState('');

  const incomeCategories = [
    { value: 'SALARY', label: 'Salary' },
    { value: 'FREELANCING', label: 'Freelancing' },
    { value: 'POCKET_MONEY', label: 'Pocket Money' },
    { value: 'INVESTMENTS', label: 'Investments' },
    { value: 'OTHER', label: 'Other Sources' },
  ];

  // Helper to find display label from database value
  const getCategoryLabel = (val) => {
    const found = incomeCategories.find(c => c.value === val);
    return found ? found.label : val;
  };
  // Filter state
  const [filterMode, setFilterMode] = useState('all'); // 'monthly' | 'all'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const fetchIncomes = async (extraParams = {}) => {
    try {
      setLoading(true);
      const params = { ...extraParams };
      if (filterMode === 'monthly') {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (filterMode === 'all') {
        params.all_time = true;
      }
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;
      if (sortOrder) params.sort = sortOrder;

      const res = await api.get('income/', { params });
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

    const targetLabel = incomeCategories.find(c => c.value === source)?.label || source;

    try {
      await api.post('income/', {
        title: targetLabel,
        amount: parseFloat(amount),
        source: source,
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

    const targetLabel = incomeCategories.find(c => c.value === editSource)?.label || editSource;

    try {
      await api.patch(`income/${id}/`, {
        title: targetLabel,
        amount: parseFloat(editAmount),
        source: editSource,
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
    colorScheme: 'light', // Ensures browser native controls (calendar icon) render in dark grey
  };

  return (
    <MainLayout pageTitle="Income Tracking ">
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', alignItems: 'center' }}>
        <input placeholder="Search description..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: '220px' }} />
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ ...inputStyle, width: '180px' }}>
          <option value="">All sources</option>
          {incomeCategories.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
        </select>
        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
          <option value="all">All Time</option>
          <option value="monthly">Monthly</option>
        </select>
        {filterMode === 'monthly' && (
          <input type="month" value={`${selectedYear}-${String(selectedMonth).padStart(2,'0')}`} onChange={(e) => { const [y,m] = e.target.value.split('-'); setSelectedYear(parseInt(y)); setSelectedMonth(parseInt(m)); }} style={{ ...inputStyle, width: '160px' }} />
        )}
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest</option>
          <option value="lowest">Lowest</option>
        </select>
        <button onClick={() => fetchIncomes()} style={{ padding: '10px 14px', borderRadius: '10px', background: '#38b6ff', color: 'white', border: 'none', cursor: 'pointer' }}>Apply</button>
      </div>
      {/* CSS injection to force visibility on the native webkit datepicker icon */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.3) opacity(0.85);
          cursor: pointer;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', fontFamily: 'sans-serif' }}>
        
        {/* Total Income Metric Display Card with Green Gradient */}
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, #11998e, #38ef7d)', 
            color: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: '0 8px 20px rgba(56, 239, 125, 0.25)', 
            textAlign: 'center' 
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: 'bold' }}>
              Total Income
            </p>
            <h1 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', fontWeight: '800' }}>
              ₹{totalIncome.toFixed(2)}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Create Left Form Panel Block */}
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
              📝 Add New Income Stream
            </h3>
            <form onSubmit={handleCreateIncome} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>Category</label>
                <select 
                  value={source} 
                  onChange={(e) => setSource(e.target.value)}
                  style={inputStyle}
                >
                  {incomeCategories.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>Income Date</label>
                <input 
                  type="date" 
                  value={incomeDate} 
                  onChange={(e) => setIncomeDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  padding: '14px', 
                  background: 'linear-gradient(135deg, #11998e, #38ef7d)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(56, 239, 125, 0.3)',
                  marginTop: '8px'
                }}
              >
                Save Income
              </button>
            </form>
          </div>

          {/* Right Log Item History Results Panel Block */}
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
              📜 Income Logs History
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#3498db', fontWeight: 'bold' }}>
                ✨ Fetching statement balances...
              </div>
            ) : incomes.length === 0 ? (
              <p style={{ color: '#95a5a6', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                No recent income logs recorded yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomes.map((inc) => (
                  <div 
                    key={inc.id} 
                    style={{ 
                      borderLeft: '5px solid #38ef7d', 
                      background: '#f8fafc', 
                      padding: '16px 20px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      justify: 'space-between', 
                      alignItems: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)' 
                    }}
                  >
                    {editingId === inc.id ? (
                      /* Editing Form View layout */
                      <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} style={{ ...inputStyle, width: '110px', padding: '8px 10px' }} />
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} style={{ ...inputStyle, width: '140px', padding: '8px 10px' }} />
                        <select value={editSource} onChange={(e) => setEditSource(e.target.value)} style={{ ...inputStyle, width: '130px', padding: '8px 10px' }}>
                          {incomeCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button onClick={() => handleSaveUpdate(inc.id)} style={{ background: '#38ef7d', color: '#166534', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: '#cbd5e1', color: '#475569', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      /* Regular Entry layout Row format display block */
                      <>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '1.05rem', fontWeight: 'bold' }}>
                            {inc.title || getCategoryLabel(inc.source)}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                            Date: {inc.income_date}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                          <h3 style={{ margin: 0, color: '#11998e', fontWeight: '800', fontSize: '1.25rem' }}>
                            + ₹{parseFloat(inc.amount).toFixed(2)}
                          </h3>
                          
                          {/* Action Controls elements */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span 
                              onClick={() => {
                                setEditingId(inc.id);
                                setEditAmount(inc.amount);
                                setEditSource(inc.source);
                                setEditDate(inc.income_date);
                              }} 
                              style={{ cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }} 
                              title="Edit Item"
                            >
                              ✏️
                            </span>
                            <span 
                              onClick={() => handleDeleteIncome(inc.id)} 
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

export default Income;