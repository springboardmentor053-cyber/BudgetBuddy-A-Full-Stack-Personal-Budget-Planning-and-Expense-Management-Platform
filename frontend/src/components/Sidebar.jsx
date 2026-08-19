import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        💰 BudgetBuddy
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/login">
    🔑 Login
  </NavLink>


        <NavLink to="/" end>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/income">
          💰 Income
        </NavLink>

        <NavLink to="/expenses">
          💸 Expenses
        </NavLink>

        <NavLink to="/budgets">
          📊 Budgets
        </NavLink>

        <NavLink to="/savings">
          🎯 Savings
        </NavLink>

        <NavLink to="/notifications">
          🔔 Notifications
        </NavLink>

        <NavLink to="/analytics">
          📈 Analytics
        </NavLink>

        <NavLink to="/reports">
          📑 Reports
        </NavLink>

        <NavLink to="/settings">
          ⚙️ Settings
        </NavLink>

      </nav>

      <div className="logout">
        🚪 Logout
      </div>

    </aside>
  );
}

export default Sidebar;
