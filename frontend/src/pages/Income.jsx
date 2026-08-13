import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [incomeDate, setIncomeDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch all income entries
  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/income/');
      setIncomes(response.data);
    } catch (err) {
      setError('Failed to fetch income entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const clearForm = () => {
    setSource('');
    setAmount('');
    setDescription('');
    setIncomeDate('');
    setEditingId(null);
  };

  const handleEdit = (inc) => {
    setEditingId(inc.id);
    setSource(inc.source);
    setAmount(inc.amount);
    setDescription(inc.description || '');
    setIncomeDate(inc.income_date);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    try {
      await api.delete(`/api/income/${id}/`);
      setSuccess('Income entry deleted successfully!');
      fetchIncomes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete income entry.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side Validation
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    const payload = {
      source,
      amount: parseFloat(amount),
      description,
      income_date: incomeDate
    };

    try {
      if (editingId) {
        await api.put(`/api/income/${editingId}/`, payload);
        setSuccess('Income entry updated successfully!');
      } else {
        await api.post('/api/income/', payload);
        setSuccess('Income entry added successfully!');
      }
      clearForm();
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchIncomes();
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      if (err.response && err.response.data) {
        const backendErrors = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(backendErrors || 'Failed to save income entry.');
      } else {
        setError('Failed to save income entry.');
      }
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Income</h1>
        <p className="page-subtitle">Track your revenue streams, check your salary inputs, and manage your overall cash flow.</p>
      </header>

      {/* Messages */}
      {error && (
        <div className="alert alert-danger mb-6">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-6">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      <div className="grid-12">
        
        {/* Form Card */}
        <div className="card col-span-4" style={{ alignSelf: 'start' }}>
          <h2 className="mb-6" style={{ fontSize: 'var(--text-lg)' }}>
            {editingId ? 'Edit Income Entry' : 'Add New Income'}
          </h2>
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
            <div className="form-group">
              <label className="form-label">
                Source <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Monthly Salary, Freelance work"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="d-flex gap-4">
              <div className="form-group w-full">
                <label className="form-label">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group w-full">
                <label className="form-label">
                  Date *
                </label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                placeholder="Optional description details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="input-field"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="d-flex gap-3 mt-2">
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Incomes List Card */}
        <div className="card col-span-8">
          <h2 className="mb-6" style={{ fontSize: 'var(--text-lg)' }}>Recent Incomes</h2>
          
          {loading ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>Loading incomes...</p>
          ) : incomes.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>No incomes recorded yet. Create one to get started!</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((inc) => (
                    <tr key={inc.id}>
                      <td>
                        <div className="font-semibold text-primary-color">{inc.source}</div>
                        {inc.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{inc.description}</div>}
                      </td>
                      <td className="text-secondary-color">{inc.income_date}</td>
                      <td className="font-bold text-right" style={{ color: 'var(--success)' }}>
                        +${parseFloat(inc.amount).toFixed(2)}
                      </td>
                      <td>
                        <div className="d-flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(inc)}
                            className="btn btn-ghost"
                            style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(inc.id)}
                            className="btn btn-ghost"
                            style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', color: 'var(--error)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Income;
