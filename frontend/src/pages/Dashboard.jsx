import { useEffect, useState, useMemo } from 'react';
import { incomeService } from '../services/incomeService';
import { expenseService } from '../services/expenseService';

export default function Dashboard() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Timeframe filter state: 'ALL_TIME', 'THIS_MONTH', 'PAST_30_DAYS'
  const [timeframe, setTimeframe] = useState('ALL_TIME');
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadData = async () => {
    try {
      setLoading(true);
      const [incomeData, expenseData] = await Promise.all([
        incomeService.getIncomes(),
        expenseService.getExpenses()
      ]);
      setIncomes(Array.isArray(incomeData) ? incomeData : []);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
      setError('');
    } catch (err) {
      setError('Unable to load your financial dashboard overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Compute filtered arrays in real-time
  const summaryData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const past30DaysLimit = new Date();
    past30DaysLimit.setDate(now.getDate() - 30);

    const applyFilters = (items, type) => {
      return items.filter(item => {
        // Date check
        const dateStr = type === 'income' ? (item.income_date || item.date) : (item.expense_date || item.date);
        if (!dateStr) return true;
        const itemDate = new Date(dateStr);

        let matchesTimeframe = true;
        if (timeframe === 'THIS_MONTH') {
          matchesTimeframe = itemDate >= startOfMonth;
        } else if (timeframe === 'PAST_30_DAYS') {
          matchesTimeframe = itemDate >= past30DaysLimit;
        }

        // Category check
        let matchesCategory = true;
        if (selectedCategory !== 'All') {
          const cat = (item.category || '').toUpperCase();
          matchesCategory = cat === selectedCategory.toUpperCase();
        }

        return matchesTimeframe && matchesCategory;
      });
    };

    const finalIncomes = applyFilters(incomes, 'income');
    const finalExpenses = applyFilters(expenses, 'expense');

    const totalIncome = finalIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = finalExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [incomes, expenses, timeframe, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 ml-64">
      {/* Page Header Layout Section */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Executive Overview</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Your Financial Command Center</h1>
        <p className="text-sm text-slate-400 max-w-2xl">Monitor your income, control spending, and stay aligned with your cash-flow goals from one premium workspace.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 mb-6">
          {error}
        </div>
      )}

      {/* Controls & Filter Tool Belt */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeframe</span>
          <div className="inline-flex rounded-lg p-1 bg-slate-950 border border-slate-800">
            {['ALL_TIME', 'THIS_MONTH', 'PAST_30_DAYS'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  timeframe === t 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="SALARY">Salary</option>
            <option value="POCKET_MONEY">Pocket Money</option>
            <option value="FREELANCING">Freelancing</option>
            <option value="BUSINESS">Business</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* 3-Column Premium Layout Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Income Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-md hover:border-slate-700/50 transition-all flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">₹{summaryData?.total_income?.toLocaleString('en-IN') || '0.00'}</div>
            <p className="text-xs text-slate-500 mt-2">Filtered sum of received cash</p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-md hover:border-slate-700/50 transition-all flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">₹{summaryData?.total_expense?.toLocaleString('en-IN') || '0.00'}</div>
            <p className="text-xs text-slate-500 mt-2">Filtered sum of outbound costs</p>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-md hover:border-slate-700/50 transition-all flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Balance</span>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400 tracking-tight">₹{summaryData?.balance?.toLocaleString('en-IN') || '0.00'}</div>
            <p className="text-xs text-slate-500 mt-2">Remaining budget after expenses</p>
          </div>
        </div>
      </div>

      {/* Secondary Informational Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Status Monitor</h3>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Net Flow Status</span>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-sm">Surplus (Healthy)</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Action Center</h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-3">
              <span className="text-base">💡</span>
              <span>Track monthly wages, student allowances, and freelance earnings under the <strong className="text-slate-200">Income Tracker</strong> tab.</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-3">
              <span className="text-base">💸</span>
              <span>Log daily transport expenses, educational materials, and leisure spending under the <strong className="text-slate-200">Expense Tracker</strong> tab.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
