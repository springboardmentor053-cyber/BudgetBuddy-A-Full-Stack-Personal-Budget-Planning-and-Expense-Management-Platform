import { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import { checkNewNotifications } from '../../services/notificationCheck';

function AddExpense() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: 'food', description: '', expense_date: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const categories = ['food', 'travel', 'shopping', 'education', 'entertainment', 'healthcare', 'bills', 'miscellaneous'];

  const fetchExpenses = () => api.get('/expenses/').then((res) => setExpenses(res.data));
  useEffect(() => { fetchExpenses(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}/`, form);
        setMessage('Expense updated!');
      } else {
        await api.post('/expenses/', form);
        setMessage('Expense added!');
      }
      setForm({ title: '', amount: '', category: 'food', description: '', expense_date: '' });
      setEditingId(null);
      fetchExpenses();
      setTimeout(() => checkNewNotifications(), 500);
    } catch (err) {
      setMessage('Failed to save expense.');
    }
  };

  const handleEdit = (exp) => {
    setForm({ title: exp.title, amount: exp.amount, category: exp.category, description: exp.description || '', expense_date: exp.expense_date });
    setEditingId(exp.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}/`);
    fetchExpenses();
  };

  return (
    <MainLayout>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Expenses</h1>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="expense_date" type="date" value={form.expense_date} onChange={handleChange} required />
        <button type="submit" className="primary">{editingId ? 'Update' : 'Add'} Expense</button>
      </form>
      {message && <p style={{ color: '#8e6ff7' }}>{message}</p>}

      <div className="card">
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Expense History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#e4e7ec' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #232b3d', color: '#8892a6' }}>
              <th style={{ padding: '8px' }}>Title</th><th>Category</th><th>Date</th><th>Amount</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid #1e2536' }}>
                <td style={{ padding: '8px' }}>{exp.title}</td>
                <td style={{ textTransform: 'capitalize' }}>{exp.category}</td>
                <td>{exp.expense_date}</td>
                <td>₹{exp.amount}</td>
                <td>
                  <button className="primary" style={{ fontSize: '12px', padding: '5px 10px', marginRight: '6px' }} onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="danger" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => handleDelete(exp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default AddExpense;