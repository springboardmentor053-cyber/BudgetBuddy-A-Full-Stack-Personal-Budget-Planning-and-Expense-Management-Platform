import React from 'react';

function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Welcome to BudgetBuddy 💰</h1>
      <p>Your full-stack personal budget planning and expense management platform.</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ margin: '10px', padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Login</a>
        <a href="/register" style={{ margin: '10px', padding: '10px 20px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Register Account</a>
      </div>
    </div>
  );
}

export default Home;