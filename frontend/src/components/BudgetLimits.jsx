import React, { useState, useEffect } from 'react';
import API from '../api';
import { PiggyBank } from 'lucide-react';

const BudgetLimits = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    limit_amount: '',
    month: new Date().toISOString().slice(0, 7) // Defaults to YYYY-MM
  });

  const fetchBudgets = async () => {
    try {
      const response = await API.get('budgets/');
      
      // Handle both standard list responses and paginated DRF responses
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error.response?.data || error);
      setBudgets([]);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Split "YYYY-MM" into separate year and month integers
      const [yearStr, monthStr] = formData.month.split('-');

      // 2. Build payload matching Django's Budget model exact field names
      const payload = {
        category: formData.category,
        budget_amount: parseFloat(formData.limit_amount), // Decimal field in Django
        month: parseInt(monthStr, 10),                     // Integer field (1-12)
        year: parseInt(yearStr, 10)                        // Integer field (e.g. 2026)
      };

      await API.post('budgets/', payload);

      setFormData({
        category: '',
        limit_amount: '',
        month: new Date().toISOString().slice(0, 7)
      });

      fetchBudgets(); // Refresh list after creation
    } catch (error) {
      console.error('Error adding budget limit:', error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`budgets/${id}/`);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error.response?.data || error);
    }
  };

  return (
    <>
      <div className="card">
        <h3 className="card-title">
          <PiggyBank size={18} color="#ffb703" /> Set Budget Limit
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>CATEGORY</label>
            <input 
              className="form-input" 
              name="category" 
              placeholder="e.g. Groceries, Entertainment" 
              value={formData.category} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>MONTHLY LIMIT (₹)</label>
            <input 
              className="form-input" 
              type="number" 
              step="0.01" 
              name="limit_amount" 
              placeholder="e.g. 15000" 
              value={formData.limit_amount} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>MONTH</label>
            <input 
              className="form-input" 
              type="month" 
              name="month" 
              value={formData.month} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">Set Budget</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Active Budget Limits</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {budgets.length > 0 ? (
            budgets.map((b) => (
              <li 
                key={b.id} 
                style={{ 
                  marginBottom: '10px', 
                  padding: '12px', 
                  background: '#1a1f2c', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  justify: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <div>
                  <strong>{b.category}</strong> - <span style={{ color: '#ffb703' }}>Limit: ₹{b.budget_amount}</span>
                  <div style={{ fontSize: '0.8rem', color: '#8c93a8' }}>
                    Period: {b.month}/{b.year}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(b.id)} 
                  style={{ 
                    background: '#ff3b6b', 
                    border: 'none', 
                    color: '#fff', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }}
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p style={{ color: '#8c93a8', fontSize: '0.9rem' }}>No budget limits configured.</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default BudgetLimits;