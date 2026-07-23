import { useState } from 'react';
import api from '../../services/api';

function AddExpense() {
  const [form, setForm] = useState({
    title: '', amount: '', category: 'food', description: '', expense_date: ''
  });
  const [message, setMessage] = useState('');

  const categories = ['food', 'travel', 'shopping', 'education', 'entertainment', 'healthcare', 'bills', 'miscellaneous'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses/', form);
      setMessage('Expense added successfully!');
      setForm({ title: '', amount: '', category: 'food', description: '', expense_date: '' });
    } catch (err) {
      setMessage('Failed to add expense.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <select name="category" value={form.category} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input name="expense_date" type="date" value={form.expense_date} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Expense</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddExpense;