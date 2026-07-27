import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#1a252f', // Matching sidebar navy tone
      color: '#ecf0f1',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Accent Lines matching sidebar borders */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(52, 152, 219, 0.12) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Main Glass Card */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        background: '#243342', // Slightly lighter slate card body
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '50px 40px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }}>
        
        {/* Sub-tag Badge */}
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(52, 152, 219, 0.15)',
          border: '1px solid rgba(52, 152, 219, 0.3)',
          color: '#3498db',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '20px'
        }}>
          ✨ Smart Personal Finance Management
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
          fontWeight: '800',
          color: '#ffffff',
          margin: '0 0 16px 0',
          lineHeight: 1.2
        }}>
          Welcome to <span style={{ color: '#3498db' }}>BudgetBuddy</span> 
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.05rem',
          color: '#bdc3c7',
          maxWidth: '580px',
          margin: '0 auto 36px auto',
          lineHeight: '1.6'
        }}>
          Your full-stack personal budget planning and expense management platform. Track budgets, monitor savings, and control spending effortlessly.
        </p>

        {/* Action Buttons styled like dashboard components */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px',
              borderRadius: '6px',
              background: '#3498db', // Dashboard Primary Blue
              color: 'white',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2980b9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3498db';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Login
            </button>
          </Link>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px',
              borderRadius: '6px',
              background: '#2ecc71', // Dashboard Success Green
              color: 'white',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(46, 204, 113, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#27ae60';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#2ecc71';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Register Account
            </button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '28px'
        }}>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>📊</div>
            <div style={{ color: '#ecf0f1', fontWeight: '600', fontSize: '0.9rem' }}>Live Trackers</div>
            <div style={{ color: '#95a5a6', fontSize: '0.8rem', marginTop: '2px' }}>Real-time expense data</div>
          </div>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>⚠️</div>
            <div style={{ color: '#ecf0f1', fontWeight: '600', fontSize: '0.9rem' }}>Overspend Alerts</div>
            <div style={{ color: '#95a5a6', fontSize: '0.8rem', marginTop: '2px' }}>Instant category warnings</div>
          </div>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🎯</div>
            <div style={{ color: '#ecf0f1', fontWeight: '600', fontSize: '0.9rem' }}>Savings Targets</div>
            <div style={{ color: '#95a5a6', fontSize: '0.8rem', marginTop: '2px' }}>Track your milestone goals</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;