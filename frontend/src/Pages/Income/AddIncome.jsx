import { useState } from 'react';
import api from '../../services/api';

function AddIncome() {
  const [form, setForm] = useState({
    title: '', amount: '', source: 'OTHER', description: '', income_date: ''
  });
  const [message, setMessage] = useState('');

  const sources = ['SALARY', 'POCKET_MONEY', 'SCHOLARSHIP', 'FREELANCING', 'BUSINESS', 'OTHER'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/income/', form);
      setMessage('Income added successfully!');
      setForm({ title: '', amount: '', source: 'OTHER', description: '', income_date: '' });
    } catch (err) {
      setMessage('Failed to add income.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Add Income</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <select name="source" value={form.source} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input name="income_date" type="date" value={form.income_date} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Income</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddIncome;