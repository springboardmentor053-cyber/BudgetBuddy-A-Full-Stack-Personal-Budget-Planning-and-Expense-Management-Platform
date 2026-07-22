import { Link, useNavigate } from "react-router-dom";
import { FaWallet, FaBars } from "react-icons/fa";

export default function Navbar({ setIsOpen }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-lg border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-4">

        {/* Left Section */}
        <div className="flex items-center gap-3">

          {/* Hamburger (Mobile Only) */}
          {token && (
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-white text-2xl"
            >
              <FaBars />
            </button>
          )}

          <FaWallet className="text-cyan-400 text-3xl" />

          <h1 className="text-xl md:text-2xl font-bold text-white">
            
          </h1>

        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-white">

          <Link
            to="/"
            className="hover:text-cyan-400 transition"
          >
            Home
          </Link>

          {!token ? (
            <>
              <Link
                to="/login"
                className="hover:text-cyan-400 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 px-4 py-2 rounded-lg font-semibold transition"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          )}

        </div>

      </div>
    </nav>
  );
}