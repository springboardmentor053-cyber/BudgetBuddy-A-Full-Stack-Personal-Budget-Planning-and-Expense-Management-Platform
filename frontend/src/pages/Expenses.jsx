import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Expenses() {
  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  // Expenses, Loading, and Total Metrics State
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter, Sorting, and Search State
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Available Category Choices (Matching Django choices)
  const categories = [
    { value: 'FOOD', label: 'Food' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'BILLS', label: 'Bills' },
    { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
  ];

  // Fetch Expenses with Filter & Sort Parameters + Fetch Total
  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      
      let url = 'expenses/';
      const params = [];
      if (filterCategory) params.push(`category=${filterCategory}`);
      if (sortBy) params.push(`sort=${sortBy}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await api.get(url);
      setExpenses(response.data);

      const totalResponse = await api.get('expenses/total/');
      setTotalExpenses(totalResponse.data.total_expenses);
    } catch (err) {
      console.error("Error loading expense data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [filterCategory, sortBy]);

  // Create Expense Form Handler
  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) {
      alert("Please fill out all fields!");
      return;
    }

    try {
      const payload = { title, amount: parseFloat(amount), category };
      await api.post('expenses/', payload);
      
      setTitle('');
      setAmount('');
      setCategory('');
      
      fetchExpenseData();
    } catch (err) {
      console.error("Error creating expense:", err);
      alert("Failed to save expense. Make sure you are logged in!");
    }
  };

  // Delete Expense Handler
  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.delete(`expenses/${id}/`);
        fetchExpenseData();
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  // Filter expenses locally by search query text
  const filteredExpenses = expenses.filter(expense =>
    expense.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reusable object to inject clean inline style with high importance override
  const inputStyleOverride = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#333',
    color: '#e0e0e0',
    WebkitTextFillColor: '#e0e0e0' // Overrides browser autofill style layers
  };

  return (
    <MainLayout pageTitle="Expense Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Total Aggregated Cost Banner */}
        <div style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: 0 }}>Total Expenses</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>
            ₹{parseFloat(totalExpenses).toFixed(2)}
          </p>
        </div>

        {/* Strict Side-by-Side Flex Layout Row */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Left Side: Register / Log Form (Fixed 35% Width) */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: '0 0 35%', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#2c3e50', margin: 0 }}>Log an Expense</h3>
            <form onSubmit={handleLogExpense} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <input 
                type="text" 
                placeholder="Item/Description" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyleOverride} 
              />
              <input 
                type="number" 
                placeholder="Amount (₹)" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={inputStyleOverride} 
              />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc', 
                  color: '#e0e0e0', 
                  backgroundColor: '#333' 
                }}
              >
                <option value="" style={{ color: '#999' }}>Select Category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} style={{ color: '#fff', backgroundColor: '#333' }}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <button type="submit" style={{ padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Log Item
              </button>
            </form>
          </div>

          {/* Right Side: Search, Controls, and History Grid List */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: '1', boxSizing: 'border-box' }}>
            
            {/* Header, Filter, and Sort Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#2c3e50', margin: 0 }}>History</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="latest">Latest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="highest">Highest amount</option>
                  <option value="lowest">Lowest amount</option>
                </select>
              </div>
            </div>

            {/* Live Search Bar Component */}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text"
                placeholder="🔍 Search expenses by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#333', color: '#e0e0e0', WebkitTextFillColor: '#e0e0e0' }}
              />
            </div>

            {/* Expenses List Rendering */}
            {loading ? (
              <p>Loading records...</p>
            ) : filteredExpenses.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>No expenses found matching the criteria.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredExpenses.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #e74c3c' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2c3e50' }}>{item.title}</strong>
                      <div style={{ marginTop: '5px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#2c3e50', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: '500' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                        ₹{parseFloat(item.amount).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDeleteExpense(item.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Delete record"
                      >
                        🗑️
                      </button>
                    </div>
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