import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    saved_amount: '0.00',
    target_date: '',
    status: 'ACTIVE',
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/savings/');
      setGoals(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      goal_name: '',
      target_amount: '',
      saved_amount: '0.00',
      target_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (goal) => {
    setIsEditing(true);
    setCurrentId(goal.id);
    setFormData({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount,
      target_date: goal.target_date,
      status: goal.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    // Frontend pre-validations
    if (!formData.goal_name || !formData.goal_name.trim()) {
      setFormError('Goal name cannot be empty.');
      return;
    }
    if (parseFloat(formData.target_amount) <= 0) {
      setFormError('Target amount must be greater than zero.');
      return;
    }
    if (parseFloat(formData.saved_amount) < 0) {
      setFormError('Saved amount cannot be negative.');
      return;
    }
    if (parseFloat(formData.saved_amount) > parseFloat(formData.target_amount)) {
      setFormError('Saved amount cannot exceed target amount.');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/api/savings/${currentId}/`, formData);
        setSuccess('Savings goal updated successfully.');
      } else {
        await api.post('/api/savings/', formData);
        setSuccess('Savings goal created successfully.');
      }
      handleCloseModal();
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchGoals();
    } catch (err) {
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          const errorMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
          setFormError(`${firstKey}: ${errorMsg}`);
        } else {
          setFormError('Validation error occurred.');
        }
      } else {
        setFormError('Failed to save goal. Please check inputs.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await api.delete(`/api/savings/${id}/`);
        setSuccess('Savings goal deleted successfully.');
        window.dispatchEvent(new CustomEvent('notification-updated'));
        fetchGoals();
      } catch (err) {
        setError('Failed to delete savings goal.');
      }
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === 'ALL') return true;
    return g.status === filter;
  });

  return (
    <div className="container">
      <header className="page-header d-flex justify-between align-center">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Track your financial targets and progress.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          + Add New Goal
        </button>
      </header>

      {error && <div className="card mb-4" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>{error}</div>}
      {success && <div className="card mb-4" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderLeft: '4px solid #22c55e' }}>{success}</div>}

      {/* Status Filter Buttons */}
      <div className="d-flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`btn ${filter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-secondary-color">Loading goals...</p>
      ) : filteredGoals.length === 0 ? (
        <div className="card text-center p-6">
          <p className="text-secondary-color">No savings goals found in this category.</p>
        </div>
      ) : (
        <div className="grid-12">
          {filteredGoals.map((goal) => {
            const target = parseFloat(goal.target_amount) || 0;
            const saved = parseFloat(goal.saved_amount) || 0;
            const remaining = Math.max(0, target - saved);
            const percentage = target > 0 ? Math.min(100, (saved / target) * 100).toFixed(1) : 0;

            const isCompleted = goal.status === 'COMPLETED' || saved >= target;

            return (
              <div key={goal.id} className="card col-span-6 d-flex flex-column justify-between">
                <div>
                  <div className="d-flex justify-between align-center mb-3">
                    <h3 className="m-0" style={{ fontSize: 'var(--text-base)', fontWeight: '600' }}>{goal.goal_name}</h3>
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          goal.status === 'COMPLETED'
                            ? '#dcfce7'
                            : goal.status === 'CANCELLED'
                            ? '#fee2e2'
                            : '#e0f2fe',
                        color:
                          goal.status === 'COMPLETED'
                            ? '#15803d'
                            : goal.status === 'CANCELLED'
                            ? '#dc2626'
                            : '#0284c7',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <p className="text-muted mb-4" style={{ fontSize: 'var(--text-xs)' }}>
                    Target Date: <strong style={{ color: 'var(--text-primary)' }}>{goal.target_date}</strong>
                  </p>

                  {/* Progress Bar Container */}
                  <div className="mb-4">
                    <div className="d-flex justify-between align-center mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      <span className="font-semibold text-secondary-color">Progress</span>
                      <span className="font-bold text-primary-color">{percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: isCompleted ? '#22c55e' : '#3b82f6',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Numbers Grid */}
                  <div className="d-flex justify-between p-3 mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-base)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved</div>
                      <div className="font-bold" style={{ color: '#16a34a', fontSize: '14px' }}>${saved.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target</div>
                      <div className="font-bold" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>${target.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Remaining</div>
                      <div className="font-bold" style={{ color: '#dc2626', fontSize: '14px' }}>${remaining.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button onClick={() => handleOpenEditModal(goal)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className="modal-container card"
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '32px',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <h2 className="m-0" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                {isEditing ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-ghost"
                style={{ padding: '4px 8px', fontSize: '20px', lineHeight: 1, color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger mb-5" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-base)', fontSize: 'var(--text-sm)' }}>
                {formError}
              </div>
            )}

            {/* Vertical Form Layout */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Field 1: Goal Name */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                  Goal Name <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="goal_name"
                  value={formData.goal_name}
                  onChange={handleChange}
                  placeholder="e.g. Emergency Fund"
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Field 2: Target Amount */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                  Target Amount ($) <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleChange}
                  placeholder="1000.00"
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Field 3: Saved Amount */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                  Saved Amount ($) <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="saved_amount"
                  value={formData.saved_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Field 4: Target Date */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                  Target Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary)' }}
                  required
                />
              </div>

              {/* Field 5: Status */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                  Status <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary)' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Bottom-Right Aligned Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '16px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  style={{ minWidth: '110px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '140px' }}
                >
                  {isEditing ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
