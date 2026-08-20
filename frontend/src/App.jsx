import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  Target,
  Coins,
  Bell,
  LogOut,
  FileText // Added FileText icon for Reports
} from 'lucide-react';
import Expenses from './components/Expenses';
import Income from './components/Income';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Login from './components/Login';
import BudgetLimits from './components/BudgetLimits';
import SavingsGoals from './components/SavingsGoals';
import Savings from './components/Savings';
import Notifications from './components/Notifications';
import Reports from './components/Reports'; // 1. Import Reports component
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // Set default view to Dashboard
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('username');

    if (token) {
      setIsAuthenticated(true);
      if (storedUser) setUsername(storedUser);
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d0f17', color: '#fff' }}>
        <h3>Loading BudgetBuddy...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {
      setUsername(localStorage.getItem('username') || 'User');
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar" style={{ justifyContent: 'space-between' }}>
        <div className="logo">BudgetBuddy</div>
        <button 
          onClick={handleLogout} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#8c93a8', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="user-card">
            <div className="avatar">{username ? username[0].toUpperCase() : 'B'}</div>
            <div className="user-name">{username || 'bhargavi'}</div>
          </div>

          <nav className="nav-menu">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <BarChart2 size={18} /> Analytics & Charts
            </button>
            <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <FileText size={18} /> Reports & PDF Export {/* 2. Sidebar button for Reports */}
            </button>
            <button className={`nav-item ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>
              <Wallet size={18} /> Income Management
            </button>
            <button className={`nav-item ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => setActiveTab('expense')}>
              <CreditCard size={18} /> Expense Tracking
            </button>
            <button className={`nav-item ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
              <PiggyBank size={18} /> Budget Limits
            </button>
            <button className={`nav-item ${activeTab === 'savings' ? 'active' : ''}`} onClick={() => setActiveTab('savings')}>
              <Coins size={18} /> Savings
            </button>
            <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} /> Notifications
            </button>
            <button className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
              <Target size={18} /> Savings Goals
            </button>
          </nav>
        </aside>

        {/* Dynamic Main Content Area */}
        <main className="content-area">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'reports' && <Reports />} {/* 3. Render Reports component when selected */}
          {activeTab === 'income' && <Income />}
          {activeTab === 'expense' && <Expenses />}
          {activeTab === 'budget' && <BudgetLimits />}
          {activeTab === 'savings' && <Savings />}
          {activeTab === 'goals' && <SavingsGoals />}
          {activeTab === 'notifications' && <Notifications />}
        </main>
      </div>
    </div>
  );
}

export default App;