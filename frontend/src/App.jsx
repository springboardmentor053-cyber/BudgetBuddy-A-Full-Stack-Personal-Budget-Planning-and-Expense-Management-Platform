import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing/Landing';
import Login from './Login';
import Register from './Pages/Auth/Register';
import Dashboard from './Pages/Dashboard/Dashboard';
import AddExpense from './Pages/Expenses/AddExpense';
import AddIncome from './Pages/Income/AddIncome';
import AddBudget from './Pages/Budgets/AddBudget';
import SavingsGoals from './Pages/Savings/SavingsGoals';
import Notifications from './Pages/Notifications/Notifications';
import Reports from './Pages/Reports/Reports';
import Analytics from './Pages/Analytics/Analytics';
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
