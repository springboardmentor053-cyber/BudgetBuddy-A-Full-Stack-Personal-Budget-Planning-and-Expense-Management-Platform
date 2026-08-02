import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [timeframe, setTimeframe] = useState('all');
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const loadData = async (activeTimeframe, activeCategory) => {
    try {
      setLoading(true);
      const dashboardResponse = await api.get('/api/auth/dashboard/', {
        params: {
          timeframe: activeTimeframe,
          category: activeCategory,
        },
      });
      setDashboardData(dashboardResponse.data);
      setError('');
    } catch (err) {
      setError('Unable to load your financial dashboard overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(timeframe, selectedCategory);
  }, [timeframe, selectedCategory]);

  const summaryData = {
    total_income: Number(dashboardData?.total_income || 0),
    total_expense: Number(dashboardData?.total_expense || 0),
    balance: Number(dashboardData?.current_balance || 0),
  };

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
            {[
              { label: 'ALL TIME', value: 'all' },
              { label: 'THIS MONTH', value: 'this_month' },
              { label: 'PAST 30 DAYS', value: 'past_30_days' },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                aria-pressed={timeframe === value}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  timeframe === value
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
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
            <option value="All Categories">All Categories</option>
            <option value="SALARY">Salary</option>
            <option value="POCKET_MONEY">Pocket Money</option>
            <option value="SCHOLARSHIP">Scholarship</option>
            <option value="FREELANCING">Freelancing</option>
            <option value="BUSINESS">Business</option>
            <option value="FOOD">Food</option>
            <option value="TRAVEL">Travel</option>
            <option value="HEALTHCARE">Healthcare</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="EDUCATION">Education</option>
            <option value="BILLS">Bills</option>
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

      {/* Current-month budget metrics from the transaction dashboard API */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-md hover:border-slate-700/50 transition-all">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget Ceiling</span>
          <div className="text-3xl font-black text-white tracking-tight mt-4">
            ₹{Number(dashboardData?.total_budget || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-2">All budget limits set for this month</p>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-md hover:border-slate-700/50 transition-all">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Remaining Budget</span>
          <div className="text-3xl font-black text-emerald-400 tracking-tight mt-4">
            {timeframe === 'this_month'
              ? `₹${Number(dashboardData?.remaining_budget || 0).toFixed(2)}`
              : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {timeframe === 'this_month'
              ? 'Available after this month’s expenses'
              : "Switch to 'THIS MONTH' for active budget tracking"}
          </p>
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {dashboardData?.recent_transactions?.length ? dashboardData.recent_transactions.map((transaction) => (
              <div key={`${transaction.type}-${transaction.id}`} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{transaction.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{transaction.category} · {transaction.type}</p>
                </div>
                <span className={`text-sm font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )) : <>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-500 text-center">
                No recent transactions yet.
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}