import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', form);
      setMessage('Account created! Redirecting to login...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage('Registration failed. Try a different username.');
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
        <h1 style={{ color: '#8e6ff7', marginBottom: '5px' }}>💰 BudgetBuddy</h1>
        <p style={{ color: '#8892a6', marginBottom: '25px', fontSize: '14px' }}>Create your account</p>

        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px',
              border: '1px solid #2a3346', background: '#0f1420', color: '#e4e7ec' }} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px',
              border: '1px solid #2a3346', background: '#0f1420', color: '#e4e7ec' }} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px',
              border: '1px solid #2a3346', background: '#0f1420', color: '#e4e7ec' }} required />
          <button type="submit" style={{
            width: '100%', padding: '10px', border: 'none', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6c5ce7, #8e6ff7)', color: 'white',
            fontWeight: '600', cursor: 'pointer', marginBottom: '16px'
          }}>Create Account</button>
        </form>

        {message && <p style={{ color: message.includes('failed') ? '#e74c3c' : '#28a745', fontSize: '13px' }}>{message}</p>}

        <p style={{ color: '#8892a6', fontSize: '13px', marginTop: '10px' }}>
          Already have an account? <Link to="/" style={{ color: '#8e6ff7' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;