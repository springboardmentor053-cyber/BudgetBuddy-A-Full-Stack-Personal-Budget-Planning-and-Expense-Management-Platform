import { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import { checkNewNotifications } from '../../services/notificationCheck';

function AddBudget() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: 'food', budget_amount: '', month: '', year: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const categories = ['food', 'travel', 'shopping', 'education', 'entertainment', 'healthcare', 'bills', 'miscellaneous'];

  const fetchBudgets = () => api.get('/budgets/').then((res) => setBudgets(res.data));
  useEffect(() => { fetchBudgets(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.budget_amount || Number(form.budget_amount) <= 0) {
      setMessage('Budget amount must be greater than zero.');
      return;
    }
    if (!form.month || form.month < 1 || form.month > 12) {
      setMessage('Month must be between 1 and 12.');
      return;
    }
    if (!form.year) {
      setMessage('Year is required.');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/budgets/${editingId}/`, form);
        setMessage('Budget updated successfully!');
      } else {
        await api.post('/budgets/', form);
        setMessage('Budget added successfully!');
      }
      setForm({ category: 'food', budget_amount: '', month: '', year: '' });
      setEditingId(null);
      fetchBudgets();
      setTimeout(() => checkNewNotifications(), 500);
    } catch (err) {
      if (!err.response) {
        setMessage('Cannot connect to server. Please check your connection.');
      } else {
        setMessage(err.response.data?.non_field_errors?.[0] || 'Failed to save budget. Please check your input.');
      }
    }
  };

  const handleEdit = (b) => {
    setForm({ category: b.category, budget_amount: b.budget_amount, month: b.month, year: b.year });
    setEditingId(b.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/budgets/${id}/`);
    fetchBudgets();
  };

  return (
    <MainLayout>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Budgets</h1>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>{editingId ? 'Edit Budget' : 'Add Budget'}</h3>
        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="budget_amount" type="number" placeholder="Budget Amount" value={form.budget_amount} onChange={handleChange} required />
        <input name="month" type="number" placeholder="Month (1-12)" value={form.month} onChange={handleChange} required />
        <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} required />
        <button type="submit" className="primary">{editingId ? 'Update' : 'Add'} Budget</button>
      </form>
      {message && <p style={{ color: '#8e6ff7' }}>{message}</p>}

      <div className="card">
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Budget History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#e4e7ec' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #232b3d', color: '#8892a6' }}>
              <th style={{ padding: '8px' }}>Category</th><th>Amount</th><th>Month</th><th>Year</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #1e2536' }}>
                <td style={{ padding: '8px', textTransform: 'capitalize' }}>{b.category}</td>
                <td>₹{b.budget_amount}</td>
                <td>{b.month}</td>
                <td>{b.year}</td>
                <td>
                  <button className="primary" style={{ fontSize: '12px', padding: '5px 10px', marginRight: '6px' }} onClick={() => handleEdit(b)}>Edit</button>
                  <button className="danger" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default AddBudget;
