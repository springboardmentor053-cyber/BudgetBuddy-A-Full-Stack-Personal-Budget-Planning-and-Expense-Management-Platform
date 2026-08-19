import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PasswordVisibilityIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.4A10.8 10.8 0 0 1 12 5.25c6.75 0 9.75 6.75 9.75 6.75a18.5 18.5 0 0 1-3.15 4.1M6.15 6.15C3.75 8.1 2.25 12 2.25 12S5.25 18.75 12 18.75c1.15 0 2.2-.2 3.15-.55" />
    </svg>
  );
}

function getLoginError(error) {
  const data = error.response?.data;

  if (!data) {
    return 'Unable to reach BudgetBuddy. Check that the backend is running.';
  }

  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;

  const messages = Object.entries(data).flatMap(([field, errors]) => {
    const values = Array.isArray(errors) ? errors : [errors];
    const label = field === 'non_field_errors' ? '' : `${field}: `;
    return values.map((message) => `${label}${message}`);
  });

  return messages.join(' ') || 'Invalid username/email or password.';
}

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Holds either username or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="mb-5 inline-flex items-center text-sm font-medium text-slate-400 transition hover:text-emerald-400">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">BudgetBuddy</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to manage your financial dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="username or name@example.com"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-slate-500 transition hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-medium">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
