import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORIES = [
  'FOOD',
  'TRAVEL',
  'SHOPPING',
  'EDUCATION',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'BILLS',
  'MISCELLANEOUS'
];

const MONTHS = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

const categoryColors = {
  FOOD: '#3b82f6',
  TRAVEL: '#d97706',
  SHOPPING: '#0284c7',
  BILLS: '#9333ea',
  EDUCATION: '#15803d',
  HEALTHCARE: '#dc2626',
  ENTERTAINMENT: '#db2777',
  MISCELLANEOUS: '#4b5563'
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Month/Year for view and consumption calculation
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Form State
  const [category, setCategory] = useState('FOOD');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState(null);

  // Fetch all budgets and expenses
  const fetchData = async () => {
    try {
      setLoading(true);
      const budgetsRes = await api.get('/api/budgets/');
      const expensesRes = await api.get('/api/expenses/');
      setBudgets(budgetsRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setCategory('FOOD');
    setBudgetAmount('');
    setMonth(filterMonth);
    setYear(filterYear);
    setEditingId(null);
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setCategory(b.category);
    setBudgetAmount(b.budget_amount);
    setMonth(b.month);
    setYear(b.year);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/api/budgets/${id}/`);
      setSuccess('Budget deleted successfully!');
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete budget.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (parseFloat(budgetAmount) <= 0) {
      setError('Budget amount must be greater than zero.');
      return;
    }

    const payload = {
      category,
      budget_amount: parseFloat(budgetAmount),
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    };

    try {
      if (editingId) {
        await api.put(`/api/budgets/${editingId}/`, payload);
        setSuccess('Budget updated successfully!');
      } else {
        await api.post('/api/budgets/', payload);
        setSuccess('Budget created successfully!');
      }
      clearForm();
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {

      if (err.response && err.response.data) {
        const backendErrors = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(backendErrors || 'Failed to save budget.');
      } else {
        setError('Failed to save budget.');
      }
    }
  };

  // Group and sum expenses for the current filtered month/year
  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach((exp) => {
      if (!exp.expense_date) return;
      const [expYear, expMonth] = exp.expense_date.split('-');
      const m = parseInt(expMonth, 10);
      const y = parseInt(expYear, 10);

      if (m === filterMonth && y === filterYear) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
      }
    });
    return categoryTotals;
  };

  const expensesByCategory = getExpensesByCategory();

  // Filter budgets to only show selected month/year
  const filteredBudgets = budgets.filter(
    (b) => b.month === filterMonth && b.year === filterYear
  );

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Budgets</h1>
        <p className="page-subtitle">Establish limits per category and track your month-to-month budget consumption.</p>
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

      {/* Monthly Filter Dashboard */}
      <div className="card d-flex flex-wrap justify-between align-center mb-6 gap-4" style={{ padding: '16px 24px' }}>
        <div className="d-flex align-center gap-2">
          <span className="font-semibold text-primary-color" style={{ fontSize: 'var(--text-sm)' }}>Viewing Month:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value, 10))}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', minWidth: '130px', backgroundColor: 'var(--bg-primary)' }}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>

          <input
            type="number"
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value, 10))}
            className="input-field"
            style={{ width: '90px', padding: '8px' }}
          />
        </div>

        <div className="d-flex gap-6">
          <div>
            <span className="d-flex font-medium" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Budgeted</span>
            <span className="font-bold text-primary-color" style={{ fontSize: 'var(--text-lg)' }}>
              ${filteredBudgets.reduce((acc, curr) => acc + parseFloat(curr.budget_amount), 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="d-flex font-medium" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</span>
            <span className="font-bold text-primary-color" style={{ fontSize: 'var(--text-lg)', color: 'var(--error)' }}>
              ${Object.values(expensesByCategory).reduce((acc, curr) => acc + curr, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid-12">
        
        {/* Form Card */}
        <div className="card col-span-4" style={{ alignSelf: 'start' }}>
          <h2 className="mb-6" style={{ fontSize: 'var(--text-lg)' }}>
            {editingId ? 'Edit Budget' : 'Set New Budget'}
          </h2>
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
            
            <div className="form-group">
              <label className="form-label">Category *</label>
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

            <div className="form-group">
              <label className="form-label">Limit ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="d-flex gap-4">
              <div className="form-group w-full">
                <label className="form-label">Month *</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="input-field"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group w-full">
                <label className="form-label">Year *</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="d-flex gap-3 mt-2">
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {editingId ? 'Update' : 'Create'}
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

        {/* Budgets Progress Bar Display */}
        <div className="card col-span-8">
          <h2 className="mb-6" style={{ fontSize: 'var(--text-lg)' }}>
            Budgets for {MONTHS.find(m => m.value === filterMonth)?.name} {filterYear}
          </h2>

          {loading ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>Loading budget data...</p>
          ) : filteredBudgets.length === 0 ? (
            <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>No budgets set for this month. Choose a category and create a budget limit!</p>
          ) : (
            <div className="d-flex flex-column gap-6">
              {filteredBudgets.map((b) => {
                const spent = expensesByCategory[b.category] || 0;
                const budgetLimit = parseFloat(b.budget_amount);
                const percent = Math.min((spent / budgetLimit) * 100, 100);
                const isOver = spent > budgetLimit;
                const isClose = spent >= budgetLimit * 0.8 && spent <= budgetLimit;

                let progressColor = categoryColors[b.category] || '#9333ea';
                if (isOver) progressColor = 'var(--error)'; // Red if exceeded
                else if (isClose) progressColor = 'var(--warning)'; // Orange if > 80%

                return (
                  <div key={b.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-base)' }}>
                    <div className="d-flex justify-between align-center mb-2">
                      <span className="font-semibold text-primary-color d-flex align-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: categoryColors[b.category] }}></span>
                        {b.category}
                      </span>
                      <div style={{ fontSize: 'var(--text-xs)' }}>
                        <span className="font-semibold" style={{ color: isOver ? 'var(--error)' : 'var(--text-primary)' }}>${spent.toFixed(2)}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / ${budgetLimit.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-container mb-3">
                      <div className="progress-bar-fill" style={{ width: `${percent}%`, backgroundColor: progressColor }}></div>
                    </div>

                    <div className="d-flex justify-between align-center">
                      <span className="font-medium" style={{ fontSize: 'var(--text-xs)', color: isOver ? 'var(--error)' : isClose ? 'var(--warning)' : 'var(--success)' }}>
                        {isOver ? '⚠️ Budget limit exceeded!' : isClose ? '⚡ Approaching budget limit' : '🟢 Budget within safe limits'}
                      </span>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', color: 'var(--error)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Budgets;
