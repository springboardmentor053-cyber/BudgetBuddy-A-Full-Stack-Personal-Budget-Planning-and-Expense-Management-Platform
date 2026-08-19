import React, { useState } from 'react';
import API from '../api';

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      // --- REGISTRATION FLOW ---
      try {
        await API.post('auth/register/', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        setSuccessMsg('Account created successfully! Please log in.');
        setIsRegistering(false);
        setFormData({ username: formData.username, email: '', password: '' });
      } catch (err) {
        setError(err.response?.data?.detail || 'Registration failed. Try a different username/email.');
      }
    } else {
      // --- LOGIN FLOW ---
      try {
        const response = await API.post('token/', {
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('username', formData.username);
        
        onLoginSuccess();
      } catch (err) {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0d0f17'
    }}>
      <div className="card" style={{ width: '360px' }}>
        <h2 style={{ color: '#ff3b6b', textAlign: 'center', marginBottom: '20px' }}>
          {isRegistering ? 'BudgetBuddy Sign Up' : 'BudgetBuddy Login'}
        </h2>

        {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
        {successMsg && <p style={{ color: '#2ec4b6', textAlign: 'center', marginBottom: '15px' }}>{successMsg}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>USERNAME</label>
            <input 
              name="username" 
              className="form-input" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>EMAIL</label>
              <input 
                type="email"
                name="email" 
                className="form-input" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>PASSWORD</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
            {isRegistering ? 'Sign Up' : 'Login'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p style={{ color: '#a0aec0', fontSize: '14px' }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{' '}
            <span 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccessMsg('');
              }}
              style={{ color: '#ff3b6b', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isRegistering ? 'Log in' : 'Sign up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;