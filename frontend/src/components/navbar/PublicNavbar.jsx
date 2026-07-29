import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaWallet,
  FaBars,
  FaTimes,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-3.5">
        
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <FaWallet className="text-xl md:text-2xl" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            BudgetBuddy
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-semibold transition ${
              isActive("/")
                ? "text-cyan-400"
                : "text-slate-300 hover:text-cyan-400"
            }`}
          >
            Home
          </Link>

          <Link
            to="/login"
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition ${
              isActive("/login")
                ? "text-cyan-400 bg-slate-800"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition duration-200 transform active:scale-95 flex items-center gap-2"
          >
            <FaUserPlus className="text-xs" />
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-cyan-400 transition"
          aria-label="Toggle Public Menu"
        >
          {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 space-y-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-sm font-semibold py-1.5 ${
              isActive("/")
                ? "text-cyan-400"
                : "text-slate-300 hover:text-cyan-400"
            }`}
          >
            Home
          </Link>

          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 text-sm font-semibold py-1.5 ${
              isActive("/login")
                ? "text-cyan-400"
                : "text-slate-300 hover:text-cyan-400"
            }`}
          >
            <FaSignInAlt className="text-slate-400" />
            Login
          </Link>

          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition"
          >
            <FaUserPlus />
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}