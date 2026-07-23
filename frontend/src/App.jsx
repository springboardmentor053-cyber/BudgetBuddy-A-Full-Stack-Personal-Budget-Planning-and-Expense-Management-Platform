import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AddExpense from './pages/Expenses/AddExpense';
import AddIncome from './pages/Income/AddIncome';
import AddBudget from './pages/Budgets/AddBudget';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '10px', background: '#f0f0f0', textAlign: 'center' }}>
        <Link to="/dashboard" style={{ margin: '0 10px' }}>Dashboard</Link>
        <Link to="/add-expense" style={{ margin: '0 10px' }}>Add Expense</Link>
        <Link to="/add-income" style={{ margin: '0 10px' }}>Add Income</Link>
        <Link to="/add-budget" style={{ margin: '0 10px' }}>Add Budget</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/add-income" element={<AddIncome />} />
        <Route path="/add-budget" element={<AddBudget />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;