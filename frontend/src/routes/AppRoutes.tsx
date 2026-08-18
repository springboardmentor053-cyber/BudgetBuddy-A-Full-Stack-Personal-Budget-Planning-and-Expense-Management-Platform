import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../Pages/Login";
import Register from "../Pages/Register";
import Settings from "../components/Settings/Settings";
import Dashboard from "../Pages/Dashboard";
import IncomePage from "../Pages/IncomePage";
import ExpensePage from "../Pages/ExpensePage";
import BudgetPage from "../Pages/BudgetPage";
import ProfilePage from "../Pages/ProfilePage";
import SettingsPage from "../Pages/SettingsPage";
import SavingsPage from "../Pages/SavingsPage";
import Layout from "../components/Layout/Layout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ReportsDashboard from "../Pages/Reports/ReportsDashboard";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Routes */}
        <Route path="/settings" element={<Settings />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/income"
            element={<IncomePage />}
          />

          <Route
            path="/expense"
            element={<ExpensePage />}
          />

          <Route
            path="/budget"
            element={<BudgetPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          <Route
            path="/savings"
            element={<SavingsPage />}
          />
          <Route path="/reports" element={<ReportsDashboard />} />s
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;