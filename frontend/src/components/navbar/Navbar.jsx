import { Link } from "react-router-dom";
import { FaWallet } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        <div className="flex items-center gap-2">
          <FaWallet className="text-cyan-400 text-3xl"/>
          <h1 className="text-2xl font-bold text-white">
            BudgetBuddy
          </h1>
        </div>

        <div className="flex gap-8 text-white">

          <Link to="/">Home</Link>

          <Link to="/dashboard">Dashboard</Link>

          <Link to="/login">Login</Link>

          <Link to="/register">Register</Link>
            <Link to="/expenses">Expenses</Link>

              <Link to="/income">Income</Link>

              <Link to="/budget">Budget</Link>

              <Link to="/savings">Savings</Link>

              <Link to="/reports">Reports</Link>

              <Link to="/profile">Profile</Link>

              <Link to="/login">Login</Link>

        </div>

      </div>
    </nav>
  );
}