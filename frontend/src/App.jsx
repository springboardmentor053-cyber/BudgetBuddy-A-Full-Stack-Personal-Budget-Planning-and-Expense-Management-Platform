import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Login from "./pages/Login";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <div className="app-layout">

        <Sidebar />

        <div className="main-section">

          <Navbar />

          <main className="page-content">

            <Routes>

              <Route path="/" element={<Dashboard />} />

              <Route path="/income" element={<Income />} />

              <Route path="/expenses" element={<Expenses />} />

              <Route path="/budgets" element={<Budgets />} />

              <Route path="/login" element={<Login />} />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;