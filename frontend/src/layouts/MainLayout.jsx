import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Receipt, PiggyBank, Target, Bell, FileText, LogOut, BarChart3 } from 'lucide-react';
import { checkNewNotifications } from '../services/notificationCheck';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add-income', label: 'Income', icon: Wallet },
  { path: '/add-expense', label: 'Expenses', icon: Receipt },
  { path: '/add-budget', label: 'Budgets', icon: PiggyBank },
  { path: '/savings-goals', label: 'Savings Goals', icon: Target },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkNewNotifications().then((count) => setUnreadCount(count));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '230px', background: '#0f1420', borderRight: '1px solid #1e2536',
        padding: '20px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '20px', color: '#8e6ff7' }}>
          BudgetBuddy
        </h2>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px', color: active ? '#fff' : '#8892a6',
              background: active ? 'linear-gradient(90deg, #6c5ce7, transparent)' : 'transparent',
              textDecoration: 'none', fontSize: '14px', position: 'relative',
            }}>
              <Icon size={18} />
              {item.label}
              {item.path === '/notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#e74c3c', color: 'white',
                  borderRadius: '10px', fontSize: '11px', padding: '1px 7px'
                }}>{unreadCount}</span>
              )}
            </Link>
          );
        })}
        <div onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
          color: '#8892a6', cursor: 'pointer', marginTop: '30px', fontSize: '14px'
        }}>
          <LogOut size={18} /> Logout
        </div>
      </aside>
      <main style={{ flex: 1, padding: '30px', background: '#0f1420' }}>{children}</main>
    </div>
  );
}

export default MainLayout;