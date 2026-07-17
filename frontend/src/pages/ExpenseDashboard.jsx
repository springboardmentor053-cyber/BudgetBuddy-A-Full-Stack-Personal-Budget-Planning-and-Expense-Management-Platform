import { useEffect, useState, useMemo } from 'react';
import { expenseService } from '../services/expenseService';

const initialFormState = {
  title: '',
  amount: '',
  category: 'FOOD',
  description: '',
  expense_date: new Date().toISOString().slice(0, 10),
};

const categoryOptions = [
  { value: 'FOOD', label: 'Food' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'BILLS', label: 'Bills' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Timeframe and category filter state
  const [timeframe, setTimeframe] = useState('All Time');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('ALL');

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Unable to load your expense data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExpenses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        description: form.description.trim(),
        expense_date: form.expense_date,
      };

      const createdExpense = await expenseService.createExpense(payload);
      setExpenses((current) => [createdExpense, ...current]);
      setForm(initialFormState);
    } catch (err) {
      setError('Could not save the expense entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter expenses in real-time
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const past30DaysLimit = new Date();
    past30DaysLimit.setDate(now.getDate() - 30);

    return expenses.filter((expense) => {
      // Date Check
      const dateStr = expense.expense_date || expense.date;
      if (!dateStr) return true;
      const itemDate = new Date(dateStr);

      let matchesTimeframe = true;
      if (timeframe === 'This Month') {
        matchesTimeframe = itemDate >= startOfMonth;
      } else if (timeframe === 'Past 30 Days') {
        matchesTimeframe = itemDate >= past30DaysLimit;
      }

      // Category Check
      let matchesCategory = true;
      if (selectedFilterCategory !== 'ALL') {
        matchesCategory = (expense.category || '').toUpperCase() === selectedFilterCategory.toUpperCase();
      }

      return matchesTimeframe && matchesCategory;
    });
  }, [expenses, timeframe, selectedFilterCategory]);

  return (
    <div className="px-4 py-8 text-slate-100 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 ml-64">
      <header className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Expense Tracker</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Organize and Track Spending</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Capture your transactions, audit categories, and align your daily spending with your long-term budgets.
        </p>
      </header>

      {/* Timeframe and Category Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {['All Time', 'This Month', 'Past 30 Days'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                timeframe === t
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Category</label>
          <select
            value={selectedFilterCategory}
            onChange={(e) => setSelectedFilterCategory(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
          >
            <option value="ALL">All Categories</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Grid Split Workspace: Form on left (Span 1), Table on right (Span 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form area: Span 1 */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800/80 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30 space-y-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-400">New Log</p>
              <h2 className="mt-1 text-xl font-bold text-white">Record expense</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  placeholder="e.g. Weekly Groceries"
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 appearance-none"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  placeholder="Optional details..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Date</label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(event) => setForm((current) => ({ ...current, expense_date: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-950/20 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Save expense'}
            </button>
          </form>
        </div>

        {/* Table area: Span 2 */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30 h-full flex flex-col justify-between">
            <div>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">History</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Recent transactions</h2>
                </div>
                {loading && <span className="text-sm text-slate-400 animate-pulse">Loading...</span>}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead className="bg-slate-950/80 text-left text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                            No expense entries found matching active filters.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-200">{expense.title}</span>
                                {expense.description && (
                                  <span className="mt-1 text-xs text-slate-500">{expense.description}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-rose-300">
                                {expense.category || 'MISCELLANEOUS'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{expense.expense_date || expense.date || '-'}</td>
                            <td className="px-4 py-3 text-right font-semibold text-rose-300">
                              ₹{Number(expense.amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
