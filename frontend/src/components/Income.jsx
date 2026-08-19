import React, { useState, useEffect } from 'react';
import API from '../api';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: 'SALARY',
    description: '',
    income_date: '',
  });

  const fetchIncomes = async () => {
    try {
      const response = await API.get('incomes/');
      setIncomes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        source: formData.source,
        description: formData.description || '',
        income_date: formData.income_date,
      };

      await API.post('incomes/', payload);
      setFormData({ title: '', amount: '', source: 'SALARY', description: '', income_date: '' });
      fetchIncomes();
    } catch (error) {
      console.error('Error adding income:', error.response ? error.response.data : error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`incomes/${id}/`);
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Income Tracker</h3>

      {/* Add Income Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label>TITLE</label>
          <input className="form-input" name="title" placeholder="e.g. Monthly Salary" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>AMOUNT (₹)</label>
          <input className="form-input" name="amount" type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>SOURCE</label>
          <select className="form-input" name="source" value={formData.source} onChange={handleChange} required>
            <option value="SALARY">Salary</option>
            <option value="POCKET_MONEY">Pocket Money</option>
            <option value="SCHOLARSHIP">Scholarship</option>
            <option value="FREELANCING">Freelancing</option>
            <option value="BUSINESS">Business</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>INCOME DATE</label>
          <input className="form-input" name="income_date" type="date" value={formData.income_date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>DESCRIPTION</label>
          <textarea className="form-textarea" name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary">Add Income</button>
      </form>

      {/* Incomes List */}
      <h3>Income History</h3>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
        {incomes.length > 0 ? (
          incomes.map((inc) => (
            <li key={inc.id} style={{ marginBottom: '10px', padding: '12px', background: '#1a1f2c', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{inc.title}</strong> - <span style={{ color: '#00e676' }}>+₹{inc.amount}</span> ({inc.source})
                <div style={{ fontSize: '0.8rem', color: '#8c93a8' }}>{inc.income_date}</div>
              </div>
              <button onClick={() => handleDelete(inc.id)} style={{ background: '#ff3b6b', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                Delete
              </button>
            </li>
          ))
        ) : (
          <p style={{ color: '#8c93a8', marginTop: '10px' }}>No income records found.</p>
        )}
      </ul>
    </div>
  );
};

export default Income;