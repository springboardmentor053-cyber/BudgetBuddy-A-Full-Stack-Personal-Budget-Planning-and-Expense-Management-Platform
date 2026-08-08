import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AddExpense from './pages/Expenses/AddExpense';
import AddIncome from './pages/Income/AddIncome';
import AddBudget from './pages/Budgets/AddBudget';
import SavingsGoals from './pages/Savings/SavingsGoals';
import Register from './pages/Auth/Register';
import Notifications from './pages/Notifications/Notifications';
import Reports from './pages/Reports/Reports';
import Analytics from './pages/Analytics/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/add-income" element={<AddIncome />} />
        <Route path="/add-budget" element={<AddBudget />} />
        <Route path="/savings-goals" element={<SavingsGoals />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
