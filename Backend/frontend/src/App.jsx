import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Income from "./Pages/Income";
import Expense from "./Pages/Expense";
import Transactions from "./Pages/Transactions";
import Budget from "./Pages/Budget";
import Savings from "./Pages/Savings";
import Notifications from "./Pages/Notifications";
import Reports from "./Pages/Reports";
import NotFound from "./Pages/NotFound";
import Settings from "./Pages/Settings";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =================================================
            MODULES
        ================================================= */}

        <Route
          path="/income"
          element={<Income />}
        />

        <Route
          path="/expense"
          element={<Expense />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/budget"
          element={<Budget />}
        />

        <Route
          path="/savings"
          element={<Savings />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* =================================================
            404
        ================================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;