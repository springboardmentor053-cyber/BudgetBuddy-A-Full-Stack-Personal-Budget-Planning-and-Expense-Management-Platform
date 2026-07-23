import { useState } from 'react';
import api from '../../services/api';

function AddBudget() {
  const [form, setForm] = useState({
    category: 'food', budget_amount: '', month: '', year: ''
  });
  const [message, setMessage] = useState('');

  const categories = ['food', 'travel', 'shopping', 'education', 'entertainment', 'healthcare', 'bills', 'miscellaneous'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets/', form);
      setMessage('Budget added successfully!');
      setForm({ category: 'food', budget_amount: '', month: '', year: '' });
    } catch (err) {
      setMessage(err.response?.data?.non_field_errors?.[0] || 'Failed to add budget.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Add Budget</h2>
      <form onSubmit={handleSubmit}>
        <select name="category" value={form.category} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="budget_amount" type="number" placeholder="Budget Amount" value={form.budget_amount} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="month" type="number" placeholder="Month (1-12)" value={form.month} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Budget</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddBudget;