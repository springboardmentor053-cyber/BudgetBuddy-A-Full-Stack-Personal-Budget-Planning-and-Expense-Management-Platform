import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getValidationError = (err) => {
    if (!err.response) {
      return 'Unable to reach backend server. Please verify the backend is running.';
    }

    const data = err.response.data;

    if (!data) {
      return `Server returned error status ${err.response.status}. Please try again.`;
    }

    if (typeof data === 'string') {
      // Return raw string or fallback if HTML 404/500 page was returned
      return data.startsWith('<!DOCTYPE') || data.startsWith('<html')
        ? `Request failed (${err.response.status}): Endpoint not found or server error.`
        : data;
    }

    if (data.detail || data.message || data.error) {
      return data.detail || data.message || data.error;
    }

    if (typeof data === 'object') {
      const messages = Object.entries(data).flatMap(([field, errors]) => {
        const fieldErrors = Array.isArray(errors) ? errors : [errors];
        const label = field === 'non_field_errors' ? '' : `${field}: `;
        return fieldErrors.map((message) => `${label}${message}`);
      });

      if (messages.length > 0) return messages.join(' | ');
    }

    return `Registration failed (${err.response.status}). Please check your inputs.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password_confirm: formData.confirmPassword,
      confirm_password: formData.confirmPassword, // Compatibility for both naming schemes
    };

    try {
      // Primary route attempt
      try {
        await api.post('/api/auth/register/', payload);
      } catch (authErr) {
        // Fallback to /api/users/register/ if 404
        if (authErr.response?.status === 404) {
          await api.post('/api/users/register/', payload);
        } else {
          throw authErr;
        }
      }
      navigate('/login');
    } catch (err) {
      setError(getValidationError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="mb-5 inline-flex items-center text-sm font-medium text-slate-400 transition hover:text-emerald-400">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">BudgetBuddy</h1>
          <p className="text-slate-400 text-sm mt-2">Create a new account to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
