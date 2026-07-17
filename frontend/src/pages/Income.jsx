import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Income() {
  // Form State
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [incomeDate, setIncomeDate] = useState('');
  const [description, setDescription] = useState(''); 

  // Income List and Loading State
  const [incomeList, setIncomeList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Available Income Source Choices matching backend constraints
  const sources = [
    { value: 'SALARY', label: 'Salary' },
    { value: 'POCKET_MONEY', label: 'Pocket Money' },
    { value: 'SCHOLARSHIP', label: 'Scholarship' },
    { value: 'FREELANCING', label: 'Freelancing' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Fetch all income entries from the database
  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const response = await api.get('income/');
      setIncomeList(response.data);
    } catch (err) {
      console.error("Error fetching income database entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, []);

  // Dynamically calculate the total income amount from the loaded list
  const totalIncome = incomeList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // Form Submit Handler
  const handleSaveIncome = async (e) => {
    e.preventDefault();
    if (!amount || !source || !incomeDate) {
      alert("Please fill out all required fields!");
      return;
    }

    try {
      const dynamicTitle = sources.find(s => s.value === source)?.label || 'Income Stream';

      const payload = {
        title: dynamicTitle, 
        amount: parseFloat(amount),
        source: source,      
        description: description, 
        income_date: incomeDate
      };
      
      await api.post('income/', payload);
      
      // Clear form inputs after successful save
      setAmount('');
      setSource('');
      setIncomeDate('');
      setDescription('');
      
      // Refresh list from database
      fetchIncomeData();
    } catch (err) {
      console.error("Error saving income entry:", err);
      alert("Failed to save income. Check the browser Network console for details!");
    }
  };

  // Delete Handler
  const handleDeleteIncome = async (id) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      try {
        await api.delete(`income/${id}/`);
        fetchIncomeData();
      } catch (err) {
        console.error("Error deleting database entry:", err);
      }
    }
  };

  const darkInputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#333',
    color: '#e0e0e0',
    WebkitTextFillColor: '#e0e0e0',
    boxSizing: 'border-box'
  };

  return (
    <MainLayout pageTitle="Income Tracking">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Total Aggregated Income Banner */}
        <div style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', letterSpacing: '0.5px' }}>Total Income</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>
            ₹{totalIncome.toFixed(2)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Left Side: Form Setup */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: '0 0 35%', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#2c3e50', margin: 0, textAlign: 'center', marginBottom: '15px' }}>Add New Income Stream</h3>
            <form onSubmit={handleSaveIncome} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <select 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{ ...darkInputStyle, width: '100%', color: source ? '#e0e0e0' : '#999' }}
              >
                <option value="" style={{ color: '#999' }}>Source (e.g. Salary, Pocket Money)</option>
                {sources.map(src => (
                  <option key={src.value} value={src.value} style={{ color: '#fff', backgroundColor: '#333' }}>
                    {src.label}
                  </option>
                ))}
              </select>
              
              <input 
                type="number" 
                placeholder="Amount" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={darkInputStyle} 
              />

              <input 
                type="date" 
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
                style={darkInputStyle} 
              />

              <input 
                type="text" 
                placeholder="Optional notes (e.g., Project bonus)" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={darkInputStyle} 
              />

              <button type="submit" style={{ padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                Save
              </button>
            </form>
          </div>

          {/* Right Side: Render List */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: '1', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#2c3e50', margin: '0 0 20px 0' }}>Income Logs History</h3>

            {loading ? (
              <p>Loading records...</p>
            ) : incomeList.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>No income records stored yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {incomeList.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #2ecc71' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2c3e50' }}>{item.title}</strong>
                      {item.description && (
                        <p style={{ margin: '2px 0 5px 0', fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>
                          {item.description}
                        </p>
                      )}
                      <div style={{ marginTop: '5px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#2c3e50', background: '#e8f8f5', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: '500' }}>
                          {item.source}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                          Date: {item.income_date}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2ecc71' }}>
                        + ₹{parseFloat(item.amount).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDeleteIncome(item.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.1rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default Income;