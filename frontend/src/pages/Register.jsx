import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/\d/.test(password)) {
      setError("Password must contain at least one digit.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/register/', {
        username,
        email,
        password
      });

      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.data) {
        // Collect errors from backend response fields
        const data = err.response.data;
        let errorMessage = '';
        for (const key in data) {
          if (Array.isArray(data[key])) {
            errorMessage += `${key}: ${data[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${data[key]} `;
          }
        }
        setError(errorMessage || 'Registration failed. Please check inputs and try again.');
      } else {
        setError('Registration failed. Network error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '12px' }}>
        <Link to="/" className="back-home-link">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      </div>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 className="mb-6 text-center">Register for BudgetBuddy</h2>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required-indicator">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="required-indicator">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              Confirm Password <span className="required-indicator">*</span>
            </label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary mt-2"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-secondary-color text-center mt-6" style={{ fontSize: 'var(--text-sm)' }}>
          Already have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
