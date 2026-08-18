import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import IncomeDashboard from './Pages/IncomeDashboard';
import ExpenseDashboard from './Pages/ExpenseDashboard';
import BudgetTracker from './Pages/BudgetTracker';
import NotificationsPage from './Pages/NotificationsPage';
import Reports from './Pages/Reports';
import SavingsGoals from './Pages/SavingsGoals';
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
      {/* pl-64 offsets main content past the fixed w-64 sidebar */}
      <main className="flex-1 min-h-screen w-full overflow-y-auto pl-64">
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

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}