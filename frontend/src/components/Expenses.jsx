import React, { useState, useEffect } from 'react';
import API from '../api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: '', // Handled as 'date' to match Django Model
  });

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: '',
  });

  // Fetch expenses from Django API safely
  const fetchExpenses = async () => {
    try {
      const response = await API.get('expenses/');
      
      // ✅ FIX: Safely parse both standard arrays AND DRF paginated responses
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setExpenses(data);
      console.log('Successfully Fetched Expenses:', data);
    } catch (error) {
      console.error('Error fetching expenses:', error.response?.data || error);
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || '',
        // Sends both key variants so backend handles whichever field name it expects
        date: formData.date || formData.expense_date, 
        expense_date: formData.date || formData.expense_date,
      };

      await API.post('expenses/', payload);

      setFormData({
        title: '',
        amount: '',
        category: '',
        description: '',
        date: '',
      });

      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error.response ? error.response.data : error);
      alert('Failed to add expense. Check console for details.');
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditFormData({
      title: expense.title || '',
      amount: expense.amount || '',
      category: expense.category || '',
      description: expense.description || '',
      date: expense.date || expense.expense_date || '',
    });
  };

  const handleUpdate = async (id) => {
    try {
      const updatePayload = {
        title: editFormData.title,
        amount: parseFloat(editFormData.amount),
        category: editFormData.category,
        description: editFormData.description || '',
        date: editFormData.date,
        expense_date: editFormData.date,
      };

      await API.put(`expenses/${id}/`, updatePayload);
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error.response ? error.response.data : error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`expenses/${id}/`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Expense Tracker</h3>

      {/* Add Expense Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label>TITLE</label>
          <input className="form-input" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>AMOUNT</label>
          <input className="form-input" name="amount" type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>CATEGORY</label>
          <input className="form-input" name="category" placeholder="Category (e.g. Food, Rent)" value={formData.category} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>EXPENSE DATE</label>
          <input className="form-input" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>DESCRIPTION</label>
          <textarea className="form-textarea" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary">Add Expense</button>
      </form>

      {/* Expenses List */}
      <h3>Your Expenses</h3>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
        {expenses.length > 0 ? (
          expenses.map((expense) => {
            const displayDate = expense.date || expense.expense_date || 'N/A';

            return (
              <li key={expense.id} style={{ marginBottom: '12px', padding: '12px', background: '#1a1f2c', borderRadius: '8px' }}>
                {editingId === expense.id ? (
                  /* Edit Mode View */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input className="form-input" name="title" value={editFormData.title} onChange={handleEditChange} required />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="form-input" name="amount" type="number" step="0.01" value={editFormData.amount} onChange={handleEditChange} required />
                      <input className="form-input" name="category" value={editFormData.category} onChange={handleEditChange} required />
                      <input className="form-input" name="date" type="date" value={editFormData.date} onChange={handleEditChange} required />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                      <button onClick={() => handleUpdate(expense.id)} style={{ background: '#00e676', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal View */
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong>{expense.title}</strong> - ₹{expense.amount} ({expense.category}) on {displayDate}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEditing(expense)} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(expense.id)} style={{ background: '#ff3b6b', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <p style={{ color: '#8c93a8', marginTop: '10px' }}>No expenses found.</p>
        )}
      </ul>
    </div>
  );
};

export default Expenses;