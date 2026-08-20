import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://budgetbuddy-backend-c8uv.onrender.com';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/token/`, { 
      username, 
      password 
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (!error.response) {
        setMessage('Cannot connect to server. Please check your internet connection.');
      } else if (error.response.status === 401) {
        setMessage('Incorrect username or password. Please try again.');
      } else {
        setMessage('Login failed. Please try again later.');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f1420', fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{
        background: '#171d2d', border: '1px solid #232b3d', borderRadius: '16px',
        padding: '40px', width: '360px', textAlign: 'center'
      }}>
        <h1 style={{ color: '#8e6ff7', marginBottom: '5px' }}>BudgetBuddy</h1>
        <p style={{ color: '#8892a6', marginBottom: '25px', fontSize: '14px' }}>Sign in to your account</p>

        <form onSubmit={handleLogin}>
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px',
              border: '1px solid #2a3346', background: '#0f1420', color: '#e4e7ec' }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px',
              border: '1px solid #2a3346', background: '#0f1420', color: '#e4e7ec' }}
          />
          <button type="submit" style={{
            width: '100%', padding: '10px', border: 'none', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6c5ce7, #8e6ff7)', color: 'white',
            fontWeight: '600', cursor: 'pointer', marginBottom: '16px'
          }}>Sign In</button>
        </form>

        {message && <p style={{ color: '#e74c3c', fontSize: '13px' }}>{message}</p>}

        <p style={{ color: '#8892a6', fontSize: '13px', marginTop: '10px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#8e6ff7' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
