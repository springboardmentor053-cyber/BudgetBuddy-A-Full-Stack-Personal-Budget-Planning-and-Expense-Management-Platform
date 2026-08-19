import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError('Username can only include letters, numbers, and underscores.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.username?.[0] || data.email?.[0] || data.password?.[0] || 'Registration failed.');
      }
    } catch (err) {
      setError('Cannot connect to backend server.');
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
          Create an Account
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#bdc3c7',
          fontSize: '0.9rem',
          marginBottom: '24px'
        }}>
          Join BudgetBuddy to start tracking your finances
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

        {success && (
          <div style={{
            background: 'rgba(46, 204, 113, 0.15)',
            border: '1px solid #2ecc71',
            color: '#2ecc71',
            padding: '10px',
            borderRadius: '6px',
            textAlign: 'left',
            fontSize: '0.88rem',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Account created! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#bdc3c7', fontWeight: '600' }}>
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#bdc3c7', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: '#1a252f',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#bdc3c7', fontWeight: '600' }}>
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px',
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 10px rgba(46, 204, 113, 0.25)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#27ae60'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2ecc71'}
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#bdc3c7', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
