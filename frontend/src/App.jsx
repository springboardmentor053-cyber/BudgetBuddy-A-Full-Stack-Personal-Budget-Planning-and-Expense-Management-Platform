import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard.jsx';
import IncomeDashboard from './pages/IncomeDashboard';
import ExpenseDashboard from './pages/ExpenseDashboard';
import BudgetTracker from './pages/BudgetTracker';
import NotificationsPage from './pages/NotificationsPage';
import Reports from './pages/Reports';
import SavingsGoals from './pages/SavingsGoals';
import Settings from './pages/Settings';
import AIChatWidget from './components/AIChatWidget';

// Public Route helper: redirects to dashboard if already authenticated
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0b1120]" aria-label="Loading session" />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// Layout shell containing the fixed Sidebar navigation and main content area
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-x-hidden">
      <Sidebar />
      {/* The sidebar is fixed, so reserve its width without constraining children. */}
      <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden lg:ml-64">
        {children}
      </main>
      {/* Floating AI Financial Advisor Widget */}
      <AIChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing / Home Page */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* Public Authentication */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
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
            path="/dashboard-overview"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
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
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
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
