import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authService,
  expenseService,
  incomeService,
  budgetService,
  savingsService,
  notificationService,
  reportService
} from '../services/api';
import AnalyticsCharts from '../components/AnalyticsCharts';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [userProfile, setUserProfile] = useState({ username: '', email: '' });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Dashboard calculations
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    recent_transactions: [],
    category_breakdown: {},
    budget_utilization: []
  });

  // Data lists
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [incomeForm, setIncomeForm] = useState({ title: '', amount: '', source: 'SALARY', description: '', income_date: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'FOOD', amount: '', date: '', description: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'FOOD', limit_amount: '', month: '' });
  const [savingsForm, setSavingsForm] = useState({ goal_name: '', target_amount: '', saved_amount: 0, deadline: '' });
  const [quickSavingsAmount, setQuickSavingsAmount] = useState({});

  // Editing state
  const [editingItem, setEditingItem] = useState(null); // { type, id }

  const CATEGORIES = ['FOOD', 'TRAVEL', 'SHOPPING', 'EDUCATION', 'ENTERTAINMENT', 'HEALTHCARE', 'BILLS', 'MISCELLANEOUS'];
  const CATEGORY_LABELS = {
    FOOD: 'Food',
    TRAVEL: 'Travel & Transport',
    SHOPPING: 'Shopping',
    EDUCATION: 'Education',
    ENTERTAINMENT: 'Entertainment',
    HEALTHCARE: 'Healthcare',
    BILLS: 'Bills & Utilities',
    MISCELLANEOUS: 'Miscellaneous'
  };
  const getCategoryLabel = (cat) => CATEGORY_LABELS[cat] || cat;
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashStats, incList, expList, budList, savList, notifList, profile] = await Promise.all([
        reportService.getDashboardData(),
        incomeService.getAll(),
        expenseService.getAll(),
        budgetService.getAll(),
        savingsService.getAll(),
        notificationService.getAll(),
        authService.getProfile()
      ]);

      setStats(dashStats);
      setIncomes(incList);
      setExpenses(expList);
      setBudgets(budList);
      setSavings(savList);
      setNotifications(notifList);
      setUserProfile(profile);
    } catch {
      setError('Failed to fetch financial data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // CRUD handlers - Income
  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'income') {
        await incomeService.update(editingItem.id, incomeForm);
      } else {
        await incomeService.create(incomeForm);
      }
      setIncomeForm({ title: '', amount: '', source: 'SALARY', description: '', income_date: '' });
      setEditingItem(null);
      fetchData();
    } catch {
      setError('Error saving income transaction.');
    }
  };

  const handleIncomeDelete = async (id) => {
    if (confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeService.delete(id);
        fetchData();
      } catch {
        setError('Error deleting income.');
      }
    }
  };

  // CRUD handlers - Expenses
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'expense') {
        await expenseService.update(editingItem.id, expenseForm);
      } else {
        await expenseService.create(expenseForm);
      }
      setExpenseForm({ category: 'FOOD', amount: '', date: '', description: '' });
      setEditingItem(null);
      fetchData();
    } catch {
      setError('Error saving expense transaction.');
    }
  };

  const handleExpenseDelete = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        fetchData();
      } catch {
        setError('Error deleting expense.');
      }
    }
  };

  // CRUD handlers - Budget
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'budget') {
        await budgetService.update(editingItem.id, budgetForm);
      } else {
        await budgetService.create(budgetForm);
      }
      setBudgetForm({ category: 'FOOD', limit_amount: '', month: '' });
      setEditingItem(null);
      fetchData();
    } catch {
      setError('Error saving budget limit.');
    }
  };

  const handleBudgetDelete = async (id) => {
    if (confirm('Delete this budget limit?')) {
      try {
        await budgetService.delete(id);
        fetchData();
      } catch {
        setError('Error deleting budget.');
      }
    }
  };

  // CRUD handlers - Savings
  const handleSavingsSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'savings') {
        await savingsService.update(editingItem.id, savingsForm);
      } else {
        await savingsService.create(savingsForm);
      }
      setSavingsForm({ goal_name: '', target_amount: '', saved_amount: 0, deadline: '' });
      setEditingItem(null);
      fetchData();
    } catch {
      setError('Error saving savings goal.');
    }
  };

  const handleQuickSavings = async (goal) => {
    const amountToAdd = parseFloat(quickSavingsAmount[goal.id] || 0);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;
    try {
      const updatedSaved = parseFloat(goal.saved_amount) + amountToAdd;
      await savingsService.update(goal.id, {
        goal_name: goal.goal_name,
        target_amount: goal.target_amount,
        saved_amount: updatedSaved,
        deadline: goal.deadline
      });
      setQuickSavingsAmount({ ...quickSavingsAmount, [goal.id]: '' });
      fetchData();
    } catch {
      setError('Error updating saved amount.');
    }
  };

  const handleSavingsDelete = async (id) => {
    if (confirm('Delete this savings goal?')) {
      try {
        await savingsService.delete(id);
        fetchData();
      } catch {
        setError('Error deleting goal.');
      }
    }
  };

  // Notifications handler
  const handleDismissNotification = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchData();
    } catch {
      setError('Error marking notification as read.');
    }
  };

  // Theme styling configurations
  const isDark = theme === 'dark';
  const themeBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md';
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const inputBg = isDark
    ? 'bg-slate-950/50 border-slate-800 focus:border-rose-500 focus:ring-rose-500/20 text-white'
    : 'bg-slate-100 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 text-slate-900 focus:bg-white';
  const selectBg = isDark
    ? 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
    : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-rose-500 focus:bg-white';
  const tableHeaderColor = isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200';
  const tableRowBorder = isDark ? 'divide-slate-800/60 hover:bg-slate-800/20' : 'divide-slate-200/80 hover:bg-slate-100/30';
  const secondaryText = isDark ? 'text-slate-400' : 'text-slate-500';

  if (loading && stats.total_income === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${themeBg}`}>
        <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-rose-400 text-sm font-semibold uppercase tracking-wider animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeBg}`}>
      
      {/* Header navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b shadow-lg transition-colors duration-300 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <span className="text-2.5xl font-black bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
            BudgetBuddy
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-violet-600 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          <button
            onClick={handleLogout}
            className={`px-4 py-2 border rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-955 border-slate-200'
            }`}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className={`w-full lg:w-64 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 lg:border-r pr-0 lg:pr-6 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          {/* User Profile Card */}
          {userProfile.username && (
            <div className={`hidden lg:flex flex-col items-center p-5 border rounded-2xl mb-4 transition-all duration-300 text-center relative overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500"></div>
              {/* User Avatar Badge with first letter of username */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md mb-3 uppercase">
                {userProfile.username.charAt(0)}
              </div>
              <h3 className="text-sm font-black tracking-tight">{userProfile.username}</h3>
              <p className={`text-xs mt-1 truncate w-full ${secondaryText}`}>{userProfile.email}</p>
            </div>
          )}

          <button
            onClick={() => { setActiveTab('dashboard'); setEditingItem(null); }}
            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 border cursor-pointer w-full text-left ${
              activeTab === 'dashboard'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 dark:text-rose-400'
                : isDark
                ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">📊</span> <span>Dashboard</span>
          </button>
          <button
            onClick={() => { setActiveTab('analytics'); setEditingItem(null); }}
            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 border cursor-pointer w-full text-left ${
              activeTab === 'analytics'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 dark:text-rose-400'
                : isDark
                ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">📈</span> <span>Analytics & Charts</span>
          </button>
          <button
            onClick={() => { setActiveTab('income'); setEditingItem(null); }}
            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 border cursor-pointer w-full text-left ${
              activeTab === 'income'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 dark:text-rose-400'
                : isDark
                ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">💵</span> <span>Income Management</span>
          </button>
          <button
            onClick={() => { setActiveTab('expenses'); setEditingItem(null); }}
            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 border cursor-pointer w-full text-left ${
              activeTab === 'expenses'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 dark:text-rose-400'
                : isDark
                ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">💳</span> <span>Expense Tracking</span>
          </button>
          <button
            onClick={() => { setActiveTab('budgets'); setEditingItem(null); }}
            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 border cursor-pointer w-full text-left ${
              activeTab === 'budgets'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 dark:text-rose-400'
                : isDark
                ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🎯</span> <span>Budget Limits</span>
          </button>
          <button
            onClick={() => { setActiveTab('savings'); setEditingItem(null); }}
            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 border cursor-pointer w-full text-left ${
              activeTab === 'savings'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 dark:text-rose-400'
                : isDark
                ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🐷</span> <span>Savings Goals</span>
          </button>
        </aside>

        {/* Dashboard Panels */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {error && (
            <div className={`p-4 border rounded-xl text-sm flex items-center justify-between shadow-sm transition-all ${
              isDark ? 'bg-red-950/40 border-red-900/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-900 font-bold ml-2 cursor-pointer">×</button>
            </div>
          )}

          {/* Notifications display */}
          {notifications.filter(n => !n.is_read).length > 0 && (
            <div className="space-y-2">
              {notifications.filter(n => !n.is_read).map(notif => (
                <div key={notif.id} className={`p-4 border rounded-xl text-sm flex items-start justify-between shadow-md transition-all ${
                  isDark ? 'bg-rose-950/20 border-rose-900/50 text-rose-200' : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  <div className="flex space-x-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{notif.message}</span>
                  </div>
                  <button
                    onClick={() => handleDismissNotification(notif.id)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold uppercase tracking-wider ml-4 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 1: DASHBOARD SUMMARY */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${cardBg}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`${secondaryText} text-xs font-bold uppercase tracking-wider`}>Total Income</h3>
                    <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 text-sm">📈</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-500">₹{stats.total_income.toFixed(2)}</div>
                  <p className={`text-xs mt-2 ${secondaryText}`}>Accumulated earnings tracked</p>
                </div>
                
                <div className={`border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${cardBg}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`${secondaryText} text-xs font-bold uppercase tracking-wider`}>Total Expenses</h3>
                    <span className="p-2 bg-rose-500/10 rounded-lg text-rose-500 text-sm">📉</span>
                  </div>
                  <div className="text-3xl font-black text-rose-500">₹{stats.total_expense.toFixed(2)}</div>
                  <p className={`text-xs mt-2 ${secondaryText}`}>Outgoings & spending limits</p>
                </div>

                <div className={`border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${cardBg}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`${secondaryText} text-xs font-bold uppercase tracking-wider`}>Net Balance</h3>
                    <span className="p-2 bg-fuchsia-500/10 rounded-lg text-fuchsia-500 text-sm">💼</span>
                  </div>
                  <div className={`text-3xl font-black ${stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ₹{stats.balance.toFixed(2)}
                  </div>
                  <p className={`text-xs mt-2 ${secondaryText}`}>Remaining wallet cash flow</p>
                </div>
              </div>

              {/* Main dashboard grids */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side elements: Budgets and category details */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Budget limits status */}
                  <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
                    <h3 className="text-md font-bold mb-5 flex items-center space-x-2">
                      <span className="text-lg">🎯</span> <span>Budget Utilization (Current Month)</span>
                    </h3>
                    {stats.budget_utilization.length === 0 ? (
                      <p className={`${secondaryText} text-sm`}>No monthly budgets configured. Click "Budget Limits" to define limits.</p>
                    ) : (
                      <div className="space-y-5">
                        {stats.budget_utilization.map((b, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-bold">{b.category}</span>
                              <span className={secondaryText}>
                                ${b.spent.toFixed(2)} / ₹{b.limit.toFixed(2)} ({b.percentage}%)
                              </span>
                            </div>
                            <div className={`w-full rounded-full h-3 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  b.percentage > 100 ? 'bg-red-500' : b.percentage > 85 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(b.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category breakdown */}
                  <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
                    <h3 className="text-md font-bold mb-5 flex items-center space-x-2">
                      <span className="text-lg">🍰</span> <span>Expense Category Breakdown</span>
                    </h3>
                    {Object.keys(stats.category_breakdown).length === 0 ? (
                      <p className={`${secondaryText} text-sm`}>No expenses tracked yet.</p>
                    ) : (
                      <div className="space-y-3.5">
                        {Object.entries(stats.category_breakdown).map(([category, amount], idx) => {
                          const percentage = stats.total_expense > 0 ? (amount / stats.total_expense * 100).toFixed(1) : 0;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-3 h-3 rounded-full ${
                                    idx % 5 === 0 ? 'bg-rose-500' :
                                    idx % 5 === 1 ? 'bg-pink-500' :
                                    idx % 5 === 2 ? 'bg-fuchsia-500' :
                                    idx % 5 === 3 ? 'bg-rose-400' : 'bg-violet-500'
                                  }`}></span>
                                  <span className="font-semibold">{getCategoryLabel(category)}</span>
                                </div>
                                <span className={`${secondaryText} font-bold`}>${amount.toFixed(2)} ({percentage}%)</span>
                              </div>
                              <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <div
                                  className={`h-full rounded-full ${
                                    idx % 5 === 0 ? 'bg-rose-500' :
                                    idx % 5 === 1 ? 'bg-pink-500' :
                                    idx % 5 === 2 ? 'bg-fuchsia-500' :
                                    idx % 5 === 3 ? 'bg-rose-400' : 'bg-violet-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side elements: Recent transaction history */}
                <div className="lg:col-span-5">
                  <div className={`border rounded-2xl p-6 transition-all duration-300 h-full ${cardBg}`}>
                    <h3 className="text-md font-bold mb-5 flex items-center space-x-2">
                      <span className="text-lg">🕒</span> <span>Recent Activity</span>
                    </h3>
                    {stats.recent_transactions.length === 0 ? (
                      <p className={`${secondaryText} text-sm`}>No transactions logged.</p>
                    ) : (
                      <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                        {stats.recent_transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                              isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`text-xl p-2 rounded-xl ${
                                tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {tx.type === 'income' ? '💵' : '💸'}
                              </span>
                              <div>
                                <h4 className="text-sm font-bold truncate max-w-[140px]">{tx.source_or_category}</h4>
                                <p className={`text-xs ${secondaryText}`}>{tx.date}</p>
                              </div>
                            </div>
                            <div className={`text-sm font-black ${
                              tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: ANALYTICS & CHARTS */}
          {activeTab === 'analytics' && (
            <AnalyticsCharts
              incomes={incomes}
              expenses={expenses}
              budgets={budgets}
              savings={savings}
              theme={theme}
              CATEGORIES={CATEGORIES}
            />
          )}

          {/* TAB 2: INCOME PANEL */}
          {activeTab === 'income' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form panel */}
              <div className={`border rounded-2xl p-6 h-fit transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">
                  {editingItem && editingItem.type === 'income' ? '✏️ Edit Income Source' : '💵 Add Income Source'}
                </h3>
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monthly Paycheck, Web Design"
                      value={incomeForm.title}
                      onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Source Category</label>
                    <select
                      value={incomeForm.source}
                      onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${selectBg}`}
                    >
                      <option value="SALARY">SALARY</option>
                      <option value="POCKET_MONEY">POCKET_MONEY</option>
                      <option value="SCHOLARSHIP">SCHOLARSHIP</option>
                      <option value="FREELANCING">FREELANCING</option>
                      <option value="BUSINESS">BUSINESS</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 5000.00"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Income Date</label>
                    <input
                      type="date"
                      required
                      value={incomeForm.income_date}
                      onChange={(e) => setIncomeForm({ ...incomeForm, income_date: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Description</label>
                    <textarea
                      placeholder="e.g. July payroll"
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm h-16 resize-none border transition-all ${inputBg}`}
                    ></textarea>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer shadow-md hover:shadow-rose-500/10"
                    >
                      {editingItem && editingItem.type === 'income' ? 'Save Changes' : 'Add Income'}
                    </button>
                    {editingItem && editingItem.type === 'income' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setIncomeForm({ title: '', amount: '', source: 'SALARY', description: '', income_date: '' });
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all border cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List panel */}
              <div className={`lg:col-span-2 border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">Logged Incomes</h3>
                {incomes.length === 0 ? (
                  <p className={`${secondaryText} text-sm`}>No income transactions found.</p>
                ) : (
                  <div className="overflow-y-auto max-h-[580px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs uppercase tracking-wider ${tableHeaderColor}`}>
                          <th className="pb-3">Title</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3 text-right">Amount</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`text-sm divide-y ${tableRowBorder}`}>
                        {incomes.map((inc) => (
                          <tr key={inc.id} className="hover:bg-slate-800/5">
                            <td className="py-4 font-bold">{inc.title}</td>
                            <td className="py-4 text-xs font-semibold uppercase tracking-wide"><span className={`px-2.5 py-0.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>{inc.source}</span></td>
                            <td className={`py-4 ${secondaryText}`}>{inc.income_date}</td>
                            <td className="py-4 text-right font-black text-emerald-500">₹{parseFloat(inc.amount).toFixed(2)}</td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center space-x-3 text-xs font-bold">
                                <button
                                  onClick={() => {
                                    setEditingItem({ type: 'income', id: inc.id });
                                    setIncomeForm({
                                      title: inc.title,
                                      amount: inc.amount,
                                      source: inc.source,
                                      description: inc.description || '',
                                      income_date: inc.income_date
                                    });
                                  }}
                                  className="text-rose-500 hover:text-rose-400 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleIncomeDelete(inc.id)}
                                  className="text-red-500 hover:text-red-400 cursor-pointer"
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
          )}

          {/* TAB 3: EXPENSE PANEL */}
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form panel */}
              <div className={`border rounded-2xl p-6 h-fit transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">
                  {editingItem && editingItem.type === 'expense' ? '✏️ Edit Expense' : '💳 Record Expense'}
                </h3>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${selectBg}`}
                    >
                      {CATEGORIES.map((c, i) => (
                        <option key={i} value={c}>{getCategoryLabel(c)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 24.50"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Date</label>
                    <input
                      type="date"
                      required
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Description</label>
                    <textarea
                      placeholder="Additional details..."
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm h-20 resize-none border transition-all ${inputBg}`}
                    ></textarea>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer shadow-md hover:shadow-rose-500/10"
                    >
                      {editingItem && editingItem.type === 'expense' ? 'Save Changes' : 'Log Expense'}
                    </button>
                    {editingItem && editingItem.type === 'expense' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setExpenseForm({ category: 'FOOD', amount: '', date: '', description: '' });
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all border cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List panel */}
              <div className={`lg:col-span-2 border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">Logged Expenses</h3>
                {expenses.length === 0 ? (
                  <p className={`${secondaryText} text-sm`}>No expenses tracked yet.</p>
                ) : (
                  <div className="overflow-y-auto max-h-[580px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs uppercase tracking-wider ${tableHeaderColor}`}>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Description</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3 text-right">Amount</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`text-sm divide-y ${tableRowBorder}`}>
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-800/5">
                            <td className="py-4 font-bold">{getCategoryLabel(exp.category)}</td>
                            <td className="py-4 max-w-[150px] truncate text-slate-500">{exp.description || '-'}</td>
                            <td className={`py-4 ${secondaryText}`}>{exp.date}</td>
                            <td className="py-4 text-right font-black text-rose-500">₹{parseFloat(exp.amount).toFixed(2)}</td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center space-x-3 text-xs font-bold">
                                <button
                                  onClick={() => {
                                    setEditingItem({ type: 'expense', id: exp.id });
                                    setExpenseForm({ category: exp.category, amount: exp.amount, date: exp.date, description: exp.description });
                                  }}
                                  className="text-rose-500 hover:text-rose-400 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleExpenseDelete(exp.id)}
                                  className="text-red-500 hover:text-red-400 cursor-pointer"
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
          )}

          {/* TAB 4: BUDGETS PANEL */}
          {activeTab === 'budgets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form panel */}
              <div className={`border rounded-2xl p-6 h-fit transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">
                  {editingItem && editingItem.type === 'budget' ? '✏️ Edit Budget' : '🎯 Create Category Budget'}
                </h3>
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Category</label>
                    <select
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${selectBg}`}
                    >
                      {CATEGORIES.map((c, i) => (
                        <option key={i} value={c}>{getCategoryLabel(c)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Limit Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 500.00"
                      value={budgetForm.limit_amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, limit_amount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Month</label>
                    <select
                      required
                      value={budgetForm.month}
                      onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${selectBg}`}
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer shadow-md hover:shadow-rose-500/10"
                    >
                      {editingItem && editingItem.type === 'budget' ? 'Save Changes' : 'Create Budget'}
                    </button>
                    {editingItem && editingItem.type === 'budget' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setBudgetForm({ category: 'FOOD', limit_amount: '', month: '' });
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all border cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List panel */}
              <div className={`lg:col-span-2 border rounded-2xl p-6 transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">Configured Budgets</h3>
                {budgets.length === 0 ? (
                  <p className={`${secondaryText} text-sm`}>No monthly budgets created yet.</p>
                ) : (
                  <div className="overflow-y-auto max-h-[580px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs uppercase tracking-wider ${tableHeaderColor}`}>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Month</th>
                          <th className="pb-3 text-right">Limit Amount</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`text-sm divide-y ${tableRowBorder}`}>
                        {budgets.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/5">
                            <td className="py-4 font-bold">{getCategoryLabel(b.category)}</td>
                            <td className="py-4 text-slate-500 font-semibold">{b.month}</td>
                            <td className="py-4 text-right font-black text-rose-500">₹{parseFloat(b.limit_amount).toFixed(2)}</td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center space-x-3 text-xs font-bold">
                                <button
                                  onClick={() => {
                                    setEditingItem({ type: 'budget', id: b.id });
                                    setBudgetForm({ category: b.category, limit_amount: b.limit_amount, month: b.month });
                                  }}
                                  className="text-rose-500 hover:text-rose-400 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleBudgetDelete(b.id)}
                                  className="text-red-500 hover:text-red-400 cursor-pointer"
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
          )}

          {/* TAB 5: SAVINGS GOALS PANEL */}
          {activeTab === 'savings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form panel */}
              <div className={`border rounded-2xl p-6 h-fit transition-all duration-300 ${cardBg}`}>
                <h3 className="text-md font-bold mb-5">
                  {editingItem && editingItem.type === 'savings' ? '✏️ Edit Savings Goal' : '🐷 Set Savings Goal'}
                </h3>
                <form onSubmit={handleSavingsSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Goal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Macbook, Emergency Fund"
                      value={savingsForm.goal_name}
                      onChange={(e) => setSavingsForm({ ...savingsForm, goal_name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Target Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2000.00"
                      value={savingsForm.target_amount}
                      onChange={(e) => setSavingsForm({ ...savingsForm, target_amount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Saved So Far (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 0.00"
                      value={savingsForm.saved_amount}
                      onChange={(e) => setSavingsForm({ ...savingsForm, saved_amount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>Deadline</label>
                    <input
                      type="date"
                      required
                      value={savingsForm.deadline}
                      onChange={(e) => setSavingsForm({ ...savingsForm, deadline: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none text-sm border transition-all ${inputBg}`}
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer shadow-md hover:shadow-rose-500/10"
                    >
                      {editingItem && editingItem.type === 'savings' ? 'Save Changes' : 'Create Goal'}
                    </button>
                    {editingItem && editingItem.type === 'savings' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setSavingsForm({ goal_name: '', target_amount: '', saved_amount: 0, deadline: '' });
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all border cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List panel with progress bars */}
              <div className="lg:col-span-2 space-y-4">
                {savings.length === 0 ? (
                  <div className={`border rounded-2xl p-6 transition-all duration-300 ${cardBg} ${secondaryText} text-sm`}>
                    No savings goals established yet.
                  </div>
                ) : (
                  savings.map((goal) => {
                    const percent = Math.min(
                      Math.round((parseFloat(goal.saved_amount) / parseFloat(goal.target_amount)) * 100),
                      100
                    );
                    return (
                      <div key={goal.id} className={`border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] ${cardBg} space-y-4`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold">{goal.goal_name}</h4>
                            <p className={`text-xs ${secondaryText}`}>Target Date: {goal.deadline}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-semibold ${secondaryText}`}>Progress: </span>
                            <span className="text-md font-bold text-rose-500">₹{parseFloat(goal.saved_amount).toFixed(2)}</span>
                            <span className={`text-xs ${secondaryText}`}> / ₹{parseFloat(goal.target_amount).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className={`w-full rounded-full h-3 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div className="bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>

                        {/* Add Quick Savings Form */}
                        <div className={`flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="Add savings..."
                              value={quickSavingsAmount[goal.id] || ''}
                              onChange={(e) => setQuickSavingsAmount({ ...quickSavingsAmount, [goal.id]: e.target.value })}
                              className={`w-32 px-3 py-1.5 rounded-lg text-xs outline-none border ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900 focus:bg-white'
                              }`}
                            />
                            <button
                              onClick={() => handleQuickSavings(goal)}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                          
                          <div className="flex space-x-3 text-xs font-bold">
                            <button
                              onClick={() => {
                                setEditingItem({ type: 'savings', id: goal.id });
                                setSavingsForm({
                                  goal_name: goal.goal_name,
                                  target_amount: goal.target_amount,
                                  saved_amount: goal.saved_amount,
                                  deadline: goal.deadline
                                });
                              }}
                              className="text-rose-500 hover:text-rose-400 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleSavingsDelete(goal.id)}
                              className="text-red-500 hover:text-red-400 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default Dashboard;