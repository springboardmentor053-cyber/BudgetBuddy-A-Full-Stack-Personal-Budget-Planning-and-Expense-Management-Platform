import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

const BUDGETS_URL = '/api/budgets/';

const categories = [
  'FOOD',
  'TRAVEL',
  'SHOPPING',
  'EDUCATION',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'BILLS',
  'MISCELLANEOUS',
];

const initialForm = {
  category: 'FOOD',
  budget_amount: '',
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
};

function getErrorMessage(data) {
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join(' ');
  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field === 'non_field_errors' ? '' : `${field}: `}${Array.isArray(messages) ? messages.join(' ') : messages}`)
      .join(' ');
  }
  return 'Something went wrong. Please try again.';
}

function getSubmissionError(data) {
  if (!data || typeof data !== 'object') return getErrorMessage(data);

  const fields = ['non_field_errors', 'category', 'budget_amount', 'amount', 'detail'];
  const messages = fields
    .filter((field) => data[field])
    .map((field) => {
      const value = data[field];
      const message = Array.isArray(value) ? value.join(' ') : typeof value === 'string' ? value : JSON.stringify(value);
      return field === 'non_field_errors' || field === 'detail' ? message : `${field}: ${message}`;
    });

  return messages.join(' ') || JSON.stringify(data);
}

function monthName(month) {
  return new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2026, Number(month) - 1, 1));
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function BudgetTracker() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [budgetToast, setBudgetToast] = useState(null);

  const request = useCallback(async (url = BUDGETS_URL, options = {}) => {
    try {
      const response = await api.request({
        url,
        method: options.method || 'GET',
        data: options.body ? JSON.parse(options.body) : undefined,
        headers: options.headers,
      });
      return response.status === 204 ? null : response.data;
    } catch (requestError) {
      const data = requestError.response?.data;
      const error = new Error(getErrorMessage(data) || requestError.message);
      error.response = requestError.response;
      throw error;
    }
  }, []);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request();
      const budgetList = Array.isArray(data) ? data : data.results || [];
      const budgetsWithSummaries = await Promise.all(
        budgetList.map(async (budget) => ({
          ...budget,
          ...(await request(`${BUDGETS_URL}${budget.id}/summary/`)),
        })),
      );
      setBudgets(budgetsWithSummaries);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load budgets.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadBudgets();
  }, [loadBudgets]);

  useEffect(() => {
    setError('');
  }, [form.category, form.budget_amount, form.month, form.year]);

  useEffect(() => {
    if (!budgetToast) return undefined;

    const timeoutId = window.setTimeout(() => setBudgetToast(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [budgetToast]);

  const resetForm = () => {
    setForm({ ...initialForm, month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()) });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = { ...form, budget_amount: Number(form.budget_amount), month: Number(form.month), year: Number(form.year) };

    if (!Number.isFinite(payload.budget_amount) || payload.budget_amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setSubmitting(true);

    try {
      await request(editingId ? `${BUDGETS_URL}${editingId}/` : BUDGETS_URL, {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      if (!editingId) {
        setBudgetToast({ amount: payload.budget_amount, category: payload.category });
      }
      resetForm();
      await loadBudgets();
    } catch (err) {
      console.error(err.response?.data);
      const backendError = err.response?.data;
      setError(getSubmissionError(backendError) || err.message || 'Unable to save this budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (budget) => {
    setError('');
    setEditingId(budget.id);
    setForm({
      category: budget.category,
      budget_amount: String(budget.budget_amount),
      month: String(budget.month),
      year: String(budget.year),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteBudget = async (id) => {
    setError('');
    try {
      await request(`${BUDGETS_URL}${id}/`, { method: 'DELETE' });
      setBudgets((current) => current.filter((budget) => budget.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || 'Unable to delete this budget.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-8 text-slate-100">
      {budgetToast && (
        <div
          className="fixed right-4 top-4 z-50 flex max-w-md items-start gap-3 rounded-xl border border-emerald-500/40 bg-slate-900 p-4 text-emerald-200 shadow-2xl shadow-slate-950/60"
          role="status"
        >
          <span className="text-xl leading-5" aria-hidden="true">✓</span>
          <p className="flex-1 text-sm leading-6">
            Budget Created! A budget of ₹{formatCurrency(budgetToast.amount)} for {budgetToast.category} has been set successfully.
          </p>
          <button
            type="button"
            onClick={() => setBudgetToast(null)}
            className="rounded-lg bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300 transition hover:bg-emerald-500/30"
          >
            Dismiss
          </button>
        </div>
      )}

      <header className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">Budget Tracker</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Plan every month with confidence</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Set category limits, then keep a clear view of the budgets guiding your spending.</p>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800/80 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">{editingId ? 'Update budget' : 'New budget'}</p>
            <h2 className="mt-1 text-xl font-bold text-white">{editingId ? 'Edit budget limit' : 'Create a budget limit'}</h2>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Budget amount</label>
            <input type="number" min="0.01" step="0.01" required value={form.budget_amount} onChange={(event) => setForm((current) => ({ ...current, budget_amount: event.target.value }))} placeholder="0.00" className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-2 block text-sm font-medium text-slate-300">Month</label><input type="number" min="1" max="12" required value={form.month} onChange={(event) => setForm((current) => ({ ...current, month: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-300">Year</label><input type="number" min="2020" required value={form.year} onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? 'Saving...' : editingId ? 'Update budget' : 'Create budget'}</button>
            {editingId && <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500">Cancel</button>}
          </div>
        </form>

        <section className="lg:col-span-2 rounded-3xl border border-slate-800/80 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Active plans</p>
              <h2 className="mt-1 text-xl font-bold text-white">Your budgets</h2>
            </div>
            {loading && <span className="text-sm text-slate-400">Loading...</span>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {!loading && budgets.length === 0 && <p className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-700 px-5 py-10 text-center text-sm text-slate-400">No budgets yet. Create your first category limit.</p>}
            {budgets.map((budget) => {
              const limit = Number(budget.budget_amount || budget.budget_limit || 0);
              const spent = Number(budget.total_expense || budget.spent || 0);
              const percentageUsed = limit > 0 ? (spent / limit) * 100 : 0;
              const isOverbudget = spent > limit;
              const overspentAmount = Math.max(0, spent - limit);
              const progressWidth = Math.min(100, Math.max(0, percentageUsed));

              return (
                <article
                  key={budget.id}
                  className={`rounded-2xl border p-5 transition ${
                    isOverbudget
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : 'border-slate-800 bg-slate-950/50 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-300">{budget.category}</span>
                    <span className="text-xs text-slate-500">{monthName(budget.month)} {budget.year}</span>
                  </div>

                  <div className="mt-6 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-bold text-white">₹{formatCurrency(limit)}</p>
                      <p className="mt-1 text-xs text-slate-500">Monthly budget limit</p>
                    </div>
                    {isOverbudget && (
                      <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded-full font-bold">
                        OVERBUDGET
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400">Spent ₹{formatCurrency(spent)}</span>
                      {!isOverbudget && <span className="font-semibold text-emerald-300">{percentageUsed.toFixed(1)}% used</span>}
                    </div>
                    {!isOverbudget && (
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progressWidth}%` }} />
                      </div>
                    )}
                    {isOverbudget && (
                      <p className="text-rose-400 font-semibold text-sm">Over by ₹{overspentAmount.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button type="button" onClick={() => startEdit(budget)} className="flex-1 rounded-xl border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10">Edit</button>
                    <button type="button" onClick={() => deleteBudget(budget.id)} className="flex-1 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10">Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
