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

  // Edit Goal State
  const [editingGoal, setEditingGoal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editSaved, setEditSaved] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState('IN_PROGRESS');

  // Fetch all Savings Goals from Backend API
  const fetchGoals = async () => {
    try {
      setLoading(true);
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

  // Create Goal
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
      await api.post('savings/', {
        goal_name: goalName,
        target_amount: parseFloat(targetAmount),
        saved_amount: savedAmount ? parseFloat(savedAmount) : 0.00,
        target_date: targetDate,
        status: status,
      });

      setGoalName('');
      setTargetAmount('');
      setSavedAmount('');
      setTargetDate('');
      setStatus('IN_PROGRESS');
      await fetchGoals();
    } catch (err) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create savings goal.';
      await fetchGoals();
      alert(`${errorMsg}\n\nIf the new goal appears after this message, the save worked and the response failed afterward.`);
    }
  };

  // Quick Add / Deposit Funds
  const handleAddDeposit = async (goal) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount!');
      return;
    }

    const newSavedTotal = parseFloat(goal.saved_amount) + parseFloat(depositAmount);
    const newStatus = newSavedTotal >= parseFloat(goal.target_amount) ? 'COMPLETED' : goal.status;

    try {
      await api.patch(`savings/${goal.id}/`, {
        saved_amount: newSavedTotal,
        status: newStatus,
      });
      setActiveDepositId(null);
      setDepositAmount('');
      await fetchGoals();
    } catch (err) {
      await fetchGoals();
      alert('Savings progress may have been updated even though the server returned an error. Please refresh to confirm.');
    }
  };

  // Open Edit Modal / Setup State
  const startEditing = (goal) => {
    setEditingGoal(goal);
    setEditName(goal.goal_name || '');
    setEditTarget(goal.target_amount || '');
    setEditSaved(goal.saved_amount || '');
    setEditDate(goal.target_date || '');
    setEditStatus(goal.status || 'IN_PROGRESS');
  };

  // Save Edit Changes
  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;

    if (!editTarget || parseFloat(editTarget) <= 0) {
      alert('Target Amount should be greater than zero.');
      return;
    }

    const autoStatus = parseFloat(editSaved) >= parseFloat(editTarget) ? 'COMPLETED' : editStatus;

    try {
      await api.put(`savings/${editingGoal.id}/`, {
        goal_name: editName,
        target_amount: parseFloat(editTarget),
        saved_amount: editSaved ? parseFloat(editSaved) : 0.00,
        target_date: editDate,
        status: autoStatus,
      });
      setEditingGoal(null);
      await fetchGoals();
    } catch (err) {
      await fetchGoals();
      alert('Savings goal may have been updated even though the server returned an error. Please refresh to confirm.');
    }
  };

  // Delete Savings Goal
  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await api.delete(`savings/${id}/`);
        fetchGoals();
      } catch (err) {
        alert('Failed to delete goal.');
      }
    }
  };

  // Aggregates
  const totalTarget = goals.reduce((acc, g) => acc + (parseFloat(g.target_amount) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (parseFloat(g.saved_amount) || 0), 0);
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: 'light'
  };

  return (
    <MainLayout pageTitle="Savings Goals ">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.3) opacity(0.8);
          cursor: pointer;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%', fontFamily: 'sans-serif' }}>

        {/* TOP GRADIENT SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              TOTAL SAVED
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              ₹{totalSaved.toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              TOTAL TARGET
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              ₹{totalTarget.toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              OVERALL PROGRESS
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {overallProgress}%
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            borderRadius: '16px',
            padding: '18px 16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(109, 40, 217, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              TOTAL GOALS
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '900', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {goals.length}
            </div>
          </div>

        </div>

        {/* CREATE SAVINGS GOAL FORM CARD */}
        <div style={{ 
          background: '#2b3d4e', // Dark Slate Navy
          padding: '25px', 
          borderRadius: '16px', 
          boxShadow: '0 8px 25px rgba(43, 61, 78, 0.25)' 
        }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700' }}>
             Create New Savings Goal
          </h3>
          
          <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Goal Name</label>
              <input 
                type="text" 
                placeholder="e.g. New Laptop, Emergency Fund" 
                value={goalName} 
                onChange={(e) => setGoalName(e.target.value)}
                required 
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Target Amount (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 50000" 
                value={targetAmount} 
                onChange={(e) => setTargetAmount(e.target.value)}
                required 
                min="0.01"
                step="0.01"
                inputMode="decimal"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Initial Saved (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 5000" 
                value={savedAmount} 
                onChange={(e) => setSavedAmount(e.target.value)}
                min="0"
                step="0.01"
                inputMode="decimal"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#ffffff', fontWeight: '700' }}>Target Date</label>
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                required 
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: '10px 24px', 
                background: 'linear-gradient(135deg, #2ecc71 0%, #10b981 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                height: '42px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              Add Goal
            </button>
          </form>
        </div>

        {/* LIST OF SAVINGS GOAL CARDS */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1.5px solid #e2e8f0', 
          padding: '25px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)' 
        }}>
          <h3 style={{ color: '#1e293b', margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700' }}>
            Your Savings Goals
          </h3>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>Loading your active savings goals...</p>
          ) : goals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', margin: '30px 0' }}>
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
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      background: isCompleted ? '#f0fdf4' : '#f1f5f9',
                      border: isCompleted ? '1.5px solid #86efac' : '1.5px solid #cbd5e1',
                      boxShadow: isCompleted ? '0 4px 12px rgba(34, 197, 94, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: isCompleted ? '#166534' : '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
                            {g.goal_name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: isCompleted ? '#15803d' : '#64748b', fontWeight: '500' }}>
                            Target: {g.target_date}
                          </span>
                        </div>
                        <span style={{
                          background: isCompleted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: '800'
                        }}>
                          {isCompleted ? 'Completed 🎉' : 'In Progress'}
                        </span>
                      </div>

                      {/* CLEAN STATIC PROGRESS BAR */}
                      <div style={{ width: '100%', height: '10px', background: isCompleted ? '#dcfce7' : '#e2e8f0', borderRadius: '5px', margin: '15px 0 10px 0', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${progressPct}%`, 
                          height: '100%', 
                          background: isCompleted ? '#10b981' : '#38b6ff'
                        }} />
                      </div>

                      {/* Detail Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: '#334155', margin: '12px 0' }}>
                              <div><strong>Saved:</strong> ₹{saved.toFixed(2)}</div>
                              <div><strong>Target:</strong> ₹{target.toFixed(2)}</div>
                              <div><strong>Remaining:</strong> ₹{remaining.toFixed(2)}</div>
                              <div><strong>Progress:</strong> {progressPct}%</div>
                              <div><strong>Days Remaining:</strong> {g.days_remaining ?? Math.max(0, Math.ceil((new Date(g.target_date) - new Date()) / (1000*60*60*24)))}</div>
                            </div>
                    </div>

                    {/* Inline Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', borderTop: isCompleted ? '1px solid #bbf7d0' : '1px solid #cbd5e1', paddingTop: '15px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {activeDepositId === g.id ? (
                        <>
                          <input 
                            type="number" 
                            placeholder="+ Amount" 
                            value={depositAmount} 
                            onChange={(e) => setDepositAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            style={{ width: '100px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
                          />
                          <button onClick={() => handleAddDeposit(g)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                            Add
                          </button>
                          <button onClick={() => setActiveDepositId(null)} style={{ padding: '6px 12px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          {!isCompleted && (
                            <button 
                              onClick={() => setActiveDepositId(g.id)}
                              style={{ padding: '6px 12px', background: '#38b6ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}
                            >
                              + Add Funds
                            </button>
                          )}
                          <button 
                            onClick={() => startEditing(g)}
                            style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteGoal(g.id)}
                            style={{ padding: '6px 12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}
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

      {/* EDIT GOAL MODAL */}
      {editingGoal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '25px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>
              ✏️ Edit Savings Goal
            </h3>
            
            <form onSubmit={handleUpdateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>Goal Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                  maxLength={80}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>Target Amount (₹)</label>
                <input 
                  type="number" 
                  value={editTarget} 
                  onChange={(e) => setEditTarget(e.target.value)} 
                  required 
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>Saved Amount (₹)</label>
                <input 
                  type="number" 
                  value={editSaved} 
                  onChange={(e) => setEditSaved(e.target.value)} 
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>Target Date</label>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingGoal(null)}
                  style={{ padding: '8px 16px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', background: '#38b6ff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Savings;
