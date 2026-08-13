import { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import { checkNewNotifications } from '../../services/notificationCheck';

function AddIncome() {
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', source: 'OTHER', description: '', income_date: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const sources = ['SALARY', 'POCKET_MONEY', 'SCHOLARSHIP', 'FREELANCING', 'BUSINESS', 'OTHER'];

  const fetchIncomes = () => api.get('/income/').then((res) => setIncomes(res.data));
  useEffect(() => { fetchIncomes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.title.trim()) {
      setMessage('Title is required.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setMessage('Amount must be greater than zero.');
      return;
    }
    if (!form.income_date) {
      setMessage('Please select a date.');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/income/${editingId}/`, form);
        setMessage('Income updated successfully!');
      } else {
        await api.post('/income/', form);
        setMessage('Income added successfully!');
      }
      setForm({ title: '', amount: '', source: 'OTHER', description: '', income_date: '' });
      setEditingId(null);
      fetchIncomes();
      setTimeout(() => checkNewNotifications(), 500);
    } catch (err) {
      if (!err.response) {
        setMessage('Cannot connect to server. Please check your connection.');
      } else {
        setMessage('Failed to save income. Please check your input.');
      }
    }
  };

  const handleEdit = (inc) => {
    setForm({ title: inc.title, amount: inc.amount, source: inc.source, description: inc.description || '', income_date: inc.income_date });
    setEditingId(inc.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/income/${id}/`);
    fetchIncomes();
  };

  return (
    <MainLayout>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Income</h1>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>{editingId ? 'Edit Income' : 'Add Income'}</h3>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <select name="source" value={form.source} onChange={handleChange}>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="income_date" type="date" value={form.income_date} onChange={handleChange} required />
        <button type="submit" className="primary">{editingId ? 'Update' : 'Add'} Income</button>
      </form>
      {message && <p style={{ color: '#8e6ff7' }}>{message}</p>}

      <div className="card">
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Income History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#e4e7ec' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #232b3d', color: '#8892a6' }}>
              <th style={{ padding: '8px' }}>Title</th><th>Source</th><th>Date</th><th>Amount</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((inc) => (
              <tr key={inc.id} style={{ borderBottom: '1px solid #1e2536' }}>
                <td style={{ padding: '8px' }}>{inc.title}</td>
                <td>{inc.source}</td>
                <td>{inc.income_date}</td>
                <td>₹{inc.amount}</td>
                <td>
                  <button className="primary" style={{ fontSize: '12px', padding: '5px 10px', marginRight: '6px' }} onClick={() => handleEdit(inc)}>Edit</button>
                  <button className="danger" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => handleDelete(inc.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default AddIncome;