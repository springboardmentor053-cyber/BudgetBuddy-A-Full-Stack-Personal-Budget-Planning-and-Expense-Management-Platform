import { Link, useNavigate } from "react-router-dom";

export default function DashboardNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        <div className="flex gap-6">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/income">Income</Link>
          <Link to="/budget">Budget</Link>
          <Link to="/savings">Savings</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}