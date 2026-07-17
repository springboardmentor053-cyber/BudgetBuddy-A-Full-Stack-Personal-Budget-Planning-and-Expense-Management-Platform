import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IncomeDashboard from './pages/IncomeDashboard';
import ExpenseDashboard from './pages/ExpenseDashboard';

// Public Route helper: redirects to dashboard if already authenticated
function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('budgetbuddy_token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// Layout shell containing the fixed Sidebar navigation and main content area
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      <Sidebar />
      <main className="flex-1 min-h-screen w-full overflow-y-auto">
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
          {/* Default Root Route: renders Login for unauthenticated users, redirects to Dashboard otherwise */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Fallback redirect for legacy login paths */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Public Registration route */}
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

          {/* Catch-all redirects to root path / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
