import { Link } from "react-router-dom";
import { FaWallet } from "react-icons/fa";

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 w-full bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2">
          <FaWallet className="text-cyan-400 text-3xl" />
          <h1 className="text-2xl font-bold">BudgetBuddy</h1>
        </div>

        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </nav>
  );
}