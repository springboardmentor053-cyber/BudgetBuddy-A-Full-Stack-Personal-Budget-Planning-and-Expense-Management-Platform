import { Link } from 'react-router-dom';
import { TrendingUp, Bell, PieChart, Shield, ArrowRight } from 'lucide-react';

function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#e8ecf3', fontFamily: 'Segoe UI, sans-serif', overflowX: 'hidden' }}>
      
      {/* Navigation Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: '1px solid #1b2436', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #34d399, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#0b1120', fontSize: '18px' }}>
            💰
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#ffffff', letterSpacing: '0.5px' }}>
            BudgetBuddy
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b' }}>
            Sign In 💰
          </Link>
          <Link to="/register" style={{ background: '#10b981', color: '#06120c', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
            Get Started 💰
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '60px 40px', gap: '40px' }}>
        <div style={{ flex: '1 1 420px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#132018', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', marginBottom: '22px', border: '1px solid #1e3a2b', fontWeight: '600' }}>
            ● Live budget tracking, built for students
          </div>
          
          {/* Main Title - Pure White & Emerald Accent */}
          <h1 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 18px', color: '#ffffff' }}>
            Take control of<br /><span style={{ color: '#34d399' }}>your money story.</span>
          </h1>
          
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', maxWidth: '440px', marginBottom: '30px' }}>
            BudgetBuddy tracks every rupee, warns you before you overspend, and turns your savings goals into visible progress — all backed by real-time alerts.
          </p>
          
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#10b981', color: '#06120c', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>
            Start Free 💰 <ArrowRight size={18} />
          </Link>

          <div style={{ display: 'flex', gap: '36px', marginTop: '50px' }}>
            {[['5', 'Core Modules'], ['3', 'Alert Levels'], ['24/7', 'Auto Tracking']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#34d399' }}>{num}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div style={{ flex: '1 1 380px', background: '#1e293b', padding: '24px', borderRadius: '14px', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <strong style={{ fontSize: '15px', color: '#ffffff' }}>This Month Overview</strong>
            <span style={{ fontSize: '11px', background: '#132018', color: '#34d399', padding: '3px 10px', borderRadius: '10px', fontWeight: '600' }}>Live</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
            <div style={{ flex: 1, background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Income</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>₹12,000</div>
            </div>
            <div style={{ flex: 1, background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Expenses</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f87171' }}>₹6,050</div>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>
              <span>Food Budget</span><span style={{ color: '#fbbf24', fontWeight: '600' }}>85%</span>
            </div>
            <div style={{ background: '#0f172a', borderRadius: '6px', height: '8px' }}>
              <div style={{ width: '85%', background: '#fbbf24', height: '100%', borderRadius: '6px' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#cbd5e1' }}>
              <span>Laptop Savings Goal</span><span style={{ color: '#34d399', fontWeight: '600' }}>40%</span>
            </div>
            <div style={{ background: '#0f172a', borderRadius: '6px', height: '8px' }}>
              <div style={{ width: '40%', background: '#34d399', height: '100%', borderRadius: '6px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ maxWidth: '1200px', margin: '10px auto 80px', padding: '0 40px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            [TrendingUp, 'Smart Tracking', 'Every expense and income entry categorized automatically.'],
            [Bell, 'Threshold Alerts', 'Get warned at 80%, 90%, and 100% of any budget — instantly.'],
            [PieChart, 'Visual Analytics', 'Pie, line, and bar charts that make your spending patterns obvious.'],
            [Shield, 'JWT Secured', 'Every API call is authenticated — your data stays yours.'],
          ].map(([Icon, title, desc], i) => (
            <div key={i} style={{ flex: '1 1 230px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <Icon size={24} color="#34d399" style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#ffffff', marginBottom: '6px', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Landing;