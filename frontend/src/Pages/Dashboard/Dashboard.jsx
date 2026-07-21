import { useState, useEffect } from 'react';
import api from '../../services/api';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, incRes, budRes] = await Promise.all([
          api.get('/expenses/'),
          api.get('/income/'),
          api.get('/budgets/'),
        ]);
        setExpenses(expRes.data);
        setIncomes(incRes.data);
        setBudgets(budRes.data);
      } catch (err) {
        setError('Failed to load data. Please log in again.');
      }
    };
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>BudgetBuddy Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px', flex: 1 }}>
          <strong>Total Income</strong>
          <p>₹{totalIncome.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', background: '#ffebee', borderRadius: '8px', flex: 1 }}>
          <strong>Total Expenses</strong>
          <p>₹{totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <h3>Recent Expenses</h3>
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>{e.title} — ₹{e.amount} ({e.category})</li>
        ))}
      </ul>

      <h3>Budgets</h3>
      <ul>
        {budgets.map((b) => (
          <li key={b.id}>{b.category} — Limit: ₹{b.monthly_limit}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;