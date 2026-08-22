import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const response = await api.post('auth/login/', { username: cleanUsername, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', response.data.username || cleanUsername);
      navigate('/dashboard');
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.detail ||
          err.response.data?.error ||
          'Login failed. Please check your username and password.'
        );
      } else {
        setError(`Cannot connect to backend server. API: ${api.defaults.baseURL}`);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#1a252f',
      color: '#ecf0f1',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      zIndex: 9999
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#243342',
        borderRadius: '12px',
        padding: '35px 30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '8px',
          color: '#ffffff',
          fontSize: '1.75rem',
          fontWeight: '700'
        }}>
          Login to <span style={{ color: '#3498db' }}>BudgetBuddy</span>
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#bdc3c7',
          fontSize: '0.9rem',
          marginBottom: '24px'
        }}>
          Enter your details below to log in
        </p>

        {error && (
          <div style={{
            background: 'rgba(231, 76, 60, 0.15)',
            border: '1px solid #e74c3c',
            color: '#e74c3c',
            padding: '10px',
            borderRadius: '6px',
            textAlign: 'left',
            fontSize: '0.88rem',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#bdc3c7', fontWeight: '600', textAlign: 'left' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_]+$"
              title="Use 3-30 characters with letters, numbers, and underscores only."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: '#1a252f',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'left'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#bdc3c7', fontWeight: '600', textAlign: 'left' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: '#1a252f',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'left'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2980b9'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3498db'}
          >
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#bdc3c7', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
