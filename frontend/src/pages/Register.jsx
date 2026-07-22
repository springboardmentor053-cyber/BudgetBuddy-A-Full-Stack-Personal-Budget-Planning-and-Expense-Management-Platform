import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.register(username, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        'Registration failed. Please check the details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs for blur effect */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-rose-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-fuchsia-600 rounded-full blur-[100px] opacity-20 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3.5xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
            Join BudgetBuddy
          </h1>
          <p className="text-slate-400 text-sm">Create an account to start planning your finances</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-emerald-300 text-sm">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-white outline-none transition-all duration-200"
              placeholder="Pick a username"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-white outline-none transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-white outline-none transition-all duration-200"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-white outline-none transition-all duration-200"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-400 hover:underline font-semibold transition-all">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;