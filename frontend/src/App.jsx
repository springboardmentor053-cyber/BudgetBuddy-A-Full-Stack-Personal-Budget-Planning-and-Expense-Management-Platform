import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Savings from "./pages/Savings";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css";


// =========================================================
// PROTECTED ROUTE
// =========================================================

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =========================================================
// APP
// =========================================================

function App() {

  // =======================================================
  // PROTECTED LAYOUT
  // =======================================================

  const protectedLayout = (page) => (
    <ProtectedRoute>

      <div className="app-layout">

        <Sidebar />

        <div className="main-section">

          <Navbar />

          <main className="page-content">
            {page}
          </main>

        </div>

      </div>

    </ProtectedRoute>
  );


  return (

    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            PROTECTED DASHBOARD
        ================================================= */}

        <Route
          path="/"
          element={protectedLayout(<Dashboard />)}
        />


        {/* =================================================
            INCOME
        ================================================= */}

        <Route
          path="/income"
          element={protectedLayout(<Income />)}
        />


        {/* =================================================
            EXPENSES
        ================================================= */}

        <Route
          path="/expenses"
          element={protectedLayout(<Expenses />)}
        />


        {/* =================================================
            BUDGETS
        ================================================= */}

        <Route
          path="/budgets"
          element={protectedLayout(<Budgets />)}
        />


        {/* =================================================
            SAVINGS
        ================================================= */}

        <Route
          path="/savings"
          element={protectedLayout(<Savings />)}
        />


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Route
          path="/notifications"
          element={protectedLayout(<Notifications />)}
        />


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <Route
          path="/analytics"
          element={protectedLayout(<Analytics />)}
        />


        {/* =================================================
            REPORTS
        ================================================= */}

        <Route
          path="/reports"
          element={protectedLayout(<Reports />)}
        />


        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={protectedLayout(<Settings />)}
        />


        {/* =================================================
            UNKNOWN URL
        ================================================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
