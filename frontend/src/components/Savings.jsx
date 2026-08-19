import React, { useState, useEffect } from 'react';
import API from '../api';
import { Target } from 'lucide-react';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    saved_amount: '0',
    target_date: '',
  });

  const fetchGoals = async () => {
    try {
      const response = await API.get('savings/');
      if (Array.isArray(response.data)) {
        setGoals(response.data);
      } else {
        setGoals([]);
      }
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
        target_amount: parseFloat(formData.target_amount),
        saved_amount: parseFloat(formData.saved_amount || 0),
        target_date: formData.target_date,
      };

      await API.post('savings/', payload);

      setFormData({
        goal_name: '',
        target_amount: '',
        saved_amount: '0',
        target_date: '',
      });

      fetchGoals();
    } catch (error) {
      console.error('Error adding savings goal:', error.response?.data || error);
      alert('Failed to add goal. Check validations.');
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

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label>GOAL NAME</label>
          <input className="form-input" name="goal_name" placeholder="e.g. New Laptop, Vacation" value={formData.goal_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>TARGET AMOUNT (₹)</label>
          <input className="form-input" name="target_amount" type="number" step="0.01" placeholder="e.g. 50000" value={formData.target_amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>INITIAL SAVED AMOUNT (₹)</label>
          <input className="form-input" name="saved_amount" type="number" step="0.01" placeholder="e.g. 10000" value={formData.saved_amount} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>TARGET DATE</label>
          <input className="form-input" name="target_date" type="date" value={formData.target_date} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn-primary">Create Savings Goal</button>
      </form>

      {/* Goals List with Progress */}
      <h3 className="card-title">Your Savings Goals</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
        {Array.isArray(goals) && goals.length > 0 ? (
          goals.map((goal) => {
            const target = parseFloat(goal.target_amount) || 0;
            const saved = parseFloat(goal.saved_amount) || 0;
            const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
            const remaining = Math.max(0, target - saved);

            return (
              <div key={goal.id} style={{ padding: '16px', background: '#1a1f2c', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>{goal.goal_name}</strong>
                  <button onClick={() => handleDelete(goal.id)} style={{ background: '#ff3b6b', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Delete
                  </button>
                </div>

                <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
                  ₹{saved} saved of ₹{target} | <strong>Remaining: ₹{remaining}</strong>
                </div>

                {/* Progress Bar */}
                <div style={{ background: '#334155', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: progress >= 100 ? '#00e676' : '#00b4d8', height: '100%', transition: 'width 0.3s' }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#8c93a8', marginTop: '4px', textAlign: 'right' }}>
                  {progress}% Complete
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: '#8c93a8' }}>No savings goals found.</p>
        )}
      </div>
    </div>
  );
};

export default Savings;  