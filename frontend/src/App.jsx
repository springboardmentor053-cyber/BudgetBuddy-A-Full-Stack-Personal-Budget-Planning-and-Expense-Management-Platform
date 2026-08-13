import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import IncomeDashboard from './Pages/IncomeDashboard';
import ExpenseDashboard from './Pages/ExpenseDashboard';
import BudgetTracker from './Pages/BudgetTracker';
import NotificationsPage from './Pages/NotificationsPage';
import Reports from './Pages/Reports';
import SavingsGoals from './Pages/SavingsGoals';

// Public Route helper: redirects to dashboard if already authenticated
function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('budgetbuddy_token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// Layout shell containing the fixed Sidebar navigation and main content area
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-x-hidden">
      <Sidebar />
      {/* pl-64 offsets main content past the fixed w-64 sidebar */}
      <main className="flex-1 min-h-screen w-full overflow-y-auto pl-64">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Root Route */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Public Registration */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Finance OS routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <IncomeDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ExpenseDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BudgetTracker />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings-goals"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SavingsGoals />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
