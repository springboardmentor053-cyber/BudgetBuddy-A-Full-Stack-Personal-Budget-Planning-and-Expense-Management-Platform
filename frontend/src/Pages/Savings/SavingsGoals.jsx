import { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ goal_name: '', target_amount: '', saved_amount: '', target_date: '' });
  const [message, setMessage] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings-goals/progress/');
      setGoals(res.data);
    } catch (err) {
      setMessage('Failed to load goals.');
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/savings-goals/', { ...form, status: 'active' });
      setMessage('Goal created!');
      setForm({ goal_name: '', target_amount: '', saved_amount: '', target_date: '' });
      fetchGoals();
    } catch (err) {
      setMessage(err.response?.data?.target_amount?.[0] || err.response?.data?.target_date?.[0] || 'Failed to create goal.');
    }
  };

  return (
  <MainLayout>
  <div style={{ maxWidth: '700px' }}>
      <h2>Savings Goals</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <input name="goal_name" placeholder="Goal Name" value={form.goal_name} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="target_amount" type="number" placeholder="Target Amount" value={form.target_amount} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="saved_amount" type="number" placeholder="Saved Amount" value={form.saved_amount} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input name="target_date" type="date" value={form.target_date} onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Goal</button>
      </form>
      {message && <p>{message}</p>}

      {goals.map((g, i) => (
        <div key={i} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{g.goal_name}</strong>
            <span style={{
              padding: '2px 10px', borderRadius: '12px', fontSize: '12px',
              background: g.status === 'completed' ? '#d4edda' : '#fff3cd',
              color: g.status === 'completed' ? '#155724' : '#856404'
            }}>{g.status}</span>
          </div>
          <p>₹{g.saved_amount} of ₹{g.target_amount} saved (₹{g.remaining_amount} remaining)</p>
          <div style={{ background: '#eee', borderRadius: '8px', overflow: 'hidden', height: '18px' }}>
            <div style={{
              width: `${Math.min(g.progress_percentage, 100)}%`,
              background: g.progress_percentage >= 100 ? '#28a745' : '#007bff',
              height: '100%', textAlign: 'center', color: 'white', fontSize: '12px', lineHeight: '18px'
            }}>
              {g.progress_percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </MainLayout>
  );
}

export default SavingsGoals;