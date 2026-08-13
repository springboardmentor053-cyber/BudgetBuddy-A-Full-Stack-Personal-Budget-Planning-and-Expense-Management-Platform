import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const navItems = [
  { label: 'Dashboard Overview', path: '/dashboard', color: 'bg-sky-400' },
  { label: 'Income Tracker', path: '/income', color: 'bg-emerald-400' },
  { label: 'Expense Tracker', path: '/expenses', color: 'bg-rose-400' },
  { label: 'Budget Tracker', path: '/budgets', color: 'bg-emerald-400' },
  { label: 'Savings Goals', path: '/savings-goals', color: 'bg-amber-400' },
  { label: 'Financial Reports', path: '/reports', color: 'bg-purple-400' },
  { label: 'Notifications', path: '/notifications', color: 'bg-cyan-400' },
];

export default function Sidebar({ onLogout, notifications: sharedNotifications }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await api.get('/api/notifications/');
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Unable to load notification count', error);
      }
    };

    if (!sharedNotifications) {
      void loadUnreadCount();
    }
  }, [sharedNotifications]);

  const unreadCount = (sharedNotifications ?? notifications).filter((notification) => !notification.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('budgetbuddy_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('budgetbuddy_username');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col justify-between border-r border-slate-900 bg-slate-950">
      {/* Brand logo section */}
      <div className="p-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 shadow-md shadow-emerald-500/10">
            <span className="text-lg font-bold text-slate-950">B</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">BudgetBuddy</h2>
            <p className="text-xs text-slate-500">Personal Finance OS</p>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-2 border-l-4 ${
                isActive
                  ? 'bg-slate-900 text-white border-l-emerald-500 shadow-sm'
                  : 'bg-transparent border-l-transparent text-slate-400 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isActive ? item.color : 'bg-slate-700'
                  } transition-all duration-200`}
                />
                <span>{item.label}</span>
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-[#00f5a0] px-2 py-0.5 text-[11px] font-extrabold text-black">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile and logout section */}
      <div className="p-4 border-t border-slate-900 space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-900">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
            <span className="text-sm font-semibold text-emerald-400">
              {localStorage.getItem('budgetbuddy_username')?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-350 truncate">
              {localStorage.getItem('budgetbuddy_username') || 'User'}
            </p>
            <p className="text-[10px] text-slate-500">Premium Plan</p>
          </div>
        </div>

        {/* Separated Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-slate-800 hover:border-rose-500/30 bg-slate-950 py-2.5 text-xs font-semibold text-slate-300 hover:text-rose-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
