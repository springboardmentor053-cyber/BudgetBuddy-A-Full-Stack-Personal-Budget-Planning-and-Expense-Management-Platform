import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Medical',
  'Entertainment',
  'Other'
];

const categoryColors = {
  Food: { bg: '#eef2f6', text: '#3b82f6' },
  Travel: { bg: '#fef3c7', text: '#d97706' },
  Shopping: { bg: '#e0f2fe', text: '#0284c7' },
  Bills: { bg: '#f3e8ff', text: '#9333ea' },
  Education: { bg: '#dcfce7', text: '#15803d' },
  Medical: { bg: '#fee2e2', text: '#dc2626' },
  Entertainment: { bg: '#fce7f3', text: '#db2777' },
  Other: { bg: '#f3f4f6', text: '#4b5563' }
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/expenses/');
      setExpenses(response.data);
    } catch (err) {
      setError('Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const clearForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDescription('');
    setExpenseDate('');
    setEditingId(null);
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDescription(expense.description || '');
    setExpenseDate(expense.expense_date);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${id}/`);
      setSuccess('Expense deleted successfully!');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete expense.');
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
      title,
      amount: parseFloat(amount),
      category,
      description,
      expense_date: expenseDate
    };

    try {
      if (editingId) {
        await api.put(`/api/expenses/${editingId}/`, payload);
        setSuccess('Expense updated successfully!');
      } else {
        await api.post('/api/expenses/', payload);
        setSuccess('Expense added successfully!');
      }
      clearForm();
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        const backendErrors = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(backendErrors || 'Failed to save expense.');
      } else {
        setError('Failed to save expense.');
      }
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Track your spendings, filter by categories, and manage your budget.</p>
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
            {editingId ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
            <div className="form-group">
              <label className="form-label">
                Title <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Grocery Shopping"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="input-field"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date *
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                placeholder="Optional notes..."
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

        {/* Expenses List Card */}
        <div className="card col-span-8">
          <h2 className="mb-6" style={{ fontSize: 'var(--text-lg)' }}>Recent Transactions</h2>
          
          {loading ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>No expenses recorded yet. Create one to get started!</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => {
                    const colors = categoryColors[exp.category] || categoryColors.Other;
                    return (
                      <tr key={exp.id}>
                        <td>
                          <div className="font-semibold text-primary-color">{exp.title}</div>
                          {exp.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{exp.description}</div>}
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: colors.bg, color: colors.text }}>
                            {exp.category}
                          </span>
                        </td>
                        <td className="text-secondary-color">{exp.expense_date}</td>
                        <td className="font-bold text-right" style={{ color: 'var(--error)' }}>
                          -${parseFloat(exp.amount).toFixed(2)}
                        </td>
                        <td>
                          <div className="d-flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(exp)}
                              className="btn btn-ghost"
                              style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="btn btn-ghost"
                              style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', color: 'var(--error)' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Expenses;
