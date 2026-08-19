import React, { useState, useEffect } from 'react';
import API from '../api';
import { Target } from 'lucide-react';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    goal_name: '',     
    target_amount: '',
    saved_amount: '0',
    target_date: ''
  });

  const fetchGoals = async () => {
    try {
      const response = await API.get('savings/');
      setGoals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      setGoals([]);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(formData.target_amount) <= 0) {
      alert('Target amount must be greater than zero.');
      return;
    }

    try {
      const payload = {
        goal_name: formData.goal_name,
        target_amount: parseFloat(formData.target_amount)||0,
        saved_amount: parseFloat(formData.saved_amount || 0),
        target_date: formData.target_date|| new Date().toISOString().split('T')[0],
      };

      await API.post('savings/', payload);
      setFormData({ goal_name: '', target_amount: '', saved_amount: '0', target_date: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error adding savings goal:', error);
      alert('Failed to save goal. Please check inputs.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`savings/${id}/`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <Target size={18} color="#00b4d8" /> Create Savings Goal
      </h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>GOAL NAME</label>
          <input className="form-input" name="goal_name" placeholder="e.g. New Laptop, Emergency Fund" value={formData.goal_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>TARGET AMOUNT (₹)</label>
          <input className="form-input" type="number" step="0.01" name="target_amount" placeholder="e.g. 80000" value={formData.target_amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>CURRENT SAVED (₹)</label>
          <input className="form-input" type="number" step="0.01" name="saved_amount" placeholder="e.g. 10000" value={formData.saved_amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>TARGET DATE</label>
          <input className="form-input" type="date" name="target_date" value={formData.target_date} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn-primary">Create Goal</button>
      </form>

      <h3 className="card-title" style={{ marginTop: '20px' }}>Your Savings Goals</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {goals.length > 0 ? (
          goals.map((g) => {
            const target = Number(g.target_amount) || 0;
            const saved = Number(g.saved_amount) || 0;
            const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

            return (
              <div key={g.id} style={{ background: '#1a1f2c', padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{g.goal_name}</strong>
                  <button onClick={() => handleDelete(g.id)} style={{ background: '#ff3b6b', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8c93a8', marginBottom: '8px' }}>
                  Saved ₹{saved} of ₹{target} ({progress}%)
                </div>
                <div style={{ background: '#2a3142', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: '#00b4d8', height: '100%', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: '#8c93a8', fontSize: '0.9rem' }}>No active savings goals found.</p>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;