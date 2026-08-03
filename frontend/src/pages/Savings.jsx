import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Savings() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for New Savings Goal
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('IN_PROGRESS');

  // Deposit/Add Money State
  const [activeDepositId, setActiveDepositId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Fetch all Savings Goals from Backend API
  const fetchGoals = async () => {
    try {
      setLoading(true);
      // FIXED: Changed 'savings/goals/' to 'savings/'
      const res = await api.get('savings/');
      const goalList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setGoals(goalList);
    } catch (err) {
      console.error('Error fetching savings goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Create Goal with Validations
  const handleCreateGoal = async (e) => {
    e.preventDefault();

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      alert('Target Amount should always be greater than zero.');
      return;
    }

    if (savedAmount && parseFloat(savedAmount) < 0) {
      alert('Saved Amount should never be negative.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (targetDate && targetDate < today) {
      alert('Target Date should not be in the past while creating a new goal.');
      return;
    }

    try {
      // FIXED: Changed 'savings/goals/' to 'savings/'
      await api.post('savings/', {
        goal_name: goalName,
        target_amount: parseFloat(targetAmount),
        saved_amount: savedAmount ? parseFloat(savedAmount) : 0.00,
        target_date: targetDate,
        status: status,
      });

      // Reset Form & Refresh List
      setGoalName('');
      setTargetAmount('');
      setSavedAmount('');
      setTargetDate('');
      setStatus('IN_PROGRESS');
      fetchGoals();
    } catch (err) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create savings goal.';
      alert(errorMsg);
    }
  };

  // Quick Add / Deposit Funds to Goal
  const handleAddDeposit = async (goal) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount!');
      return;
    }

    const newSavedTotal = parseFloat(goal.saved_amount) + parseFloat(depositAmount);
    const newStatus = newSavedTotal >= parseFloat(goal.target_amount) ? 'COMPLETED' : goal.status;

    try {
      // FIXED: Changed 'savings/goals/${goal.id}/' to 'savings/${goal.id}/'
      await api.patch(`savings/${goal.id}/`, {
        saved_amount: newSavedTotal,
        status: newStatus,
      });
      setActiveDepositId(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      alert('Error updating savings progress.');
    }
  };

  // Delete Savings Goal
  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        // FIXED: Changed 'savings/goals/${id}/' to 'savings/${id}/'
        await api.delete(`savings/${id}/`);
        fetchGoals();
      } catch (err) {
        alert('Failed to delete goal.');
      }
    }
  };

  // Metric aggregates
  const totalTarget = goals.reduce((acc, g) => acc + (parseFloat(g.target_amount) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (parseFloat(g.saved_amount) || 0), 0);
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  return (
    <MainLayout pageTitle="Savings Goals 🪙">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>

        {/* Top Summary Header Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #2ecc71' }}>
            <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL SAVED</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '1.6rem' }}>₹{totalSaved.toFixed(2)}</h2>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #3498db' }}>
            <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL TARGET</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '1.6rem' }}>₹{totalTarget.toFixed(2)}</h2>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #f1c40f' }}>
            <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>OVERALL PROGRESS</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '1.6rem' }}>{overallProgress}%</h2>
          </div>
        </div>

        {/* Create Savings Goal Form */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0', fontSize: '1.3rem' }}>Create New Savings Goal</h3>
          
          <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Goal Name</label>
              <input 
                type="text" 
                placeholder="e.g. New Laptop, Emergency Fund" 
                value={goalName} 
                onChange={(e) => setGoalName(e.target.value)}
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Target Amount (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 50000" 
                value={targetAmount} 
                onChange={(e) => setTargetAmount(e.target.value)}
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Initial Saved (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 5000" 
                value={savedAmount} 
                onChange={(e) => setSavedAmount(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>Target Date</label>
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #dcdde1', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ padding: '10px 24px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}
            >
              Add Goal
            </button>
          </form>
        </div>

        {/* List of Active Savings Goal Cards */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0', fontSize: '1.3rem' }}>Your Savings Goals</h3>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading goals...</p>
          ) : goals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#95a5a6', fontStyle: 'italic', margin: '30px 0' }}>
              No savings goals found. Create your first goal using the form above!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {goals.map((g) => {
                const target = parseFloat(g.target_amount) || 0;
                const saved = parseFloat(g.saved_amount) || 0;
                const remaining = g.remaining_amount ?? Math.max(0, target - saved);
                const progressPct = g.progress_percentage ?? (target > 0 ? Math.min(100, ((saved / target) * 100)).toFixed(1) : 0);
                const isCompleted = g.status === 'COMPLETED' || saved >= target;

                return (
                  <div 
                    key={g.id}
                    style={{
                      borderRadius: '8px',
                      padding: '20px',
                      border: isCompleted ? '1.5px solid #2ecc71' : '1px solid #e1e8ed',
                      background: isCompleted ? '#f0fff4' : '#ffffff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '1.15rem' }}>{g.goal_name}</h4>
                          <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Target: {g.target_date}</span>
                        </div>
                        <span style={{
                          background: isCompleted ? '#2ecc71' : '#3498db',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {isCompleted ? 'Completed 🎉' : 'In Progress'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '10px', background: '#ecf0f1', borderRadius: '5px', margin: '15px 0 10px 0', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPct}%`, height: '100%', background: isCompleted ? '#2ecc71' : '#3498db', transition: 'width 0.4s ease' }} />
                      </div>

                      {/* Detail Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: '#34495e', margin: '10px 0' }}>
                        <div><strong>Saved:</strong> ₹{saved.toFixed(2)}</div>
                        <div><strong>Target:</strong> ₹{target.toFixed(2)}</div>
                        <div><strong>Remaining:</strong> ₹{remaining.toFixed(2)}</div>
                        <div><strong>Progress:</strong> {progressPct}%</div>
                      </div>
                    </div>

                    {/* Inline Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #f1f2f6', paddingTop: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {activeDepositId === g.id ? (
                        <>
                          <input 
                            type="number" 
                            placeholder="+ Amount" 
                            value={depositAmount} 
                            onChange={(e) => setDepositAmount(e.target.value)}
                            style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #ccd1d9', fontSize: '0.85rem' }}
                          />
                          <button onClick={() => handleAddDeposit(g)} style={{ padding: '6px 10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Add
                          </button>
                          <button onClick={() => setActiveDepositId(null)} style={{ padding: '6px 10px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            X
                          </button>
                        </>
                      ) : (
                        <>
                          {!isCompleted && (
                            <button 
                              onClick={() => setActiveDepositId(g.id)}
                              style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                            >
                              + Add Funds
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteGoal(g.id)}
                            style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

export default Savings;