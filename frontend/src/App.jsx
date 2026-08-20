import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" theme="dark" autoClose={4000} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/add-income" element={<AddIncome />} />
        <Route path="/add-budget" element={<AddBudget />} />
        <Route path="/savings-goals" element={<SavingsGoals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;