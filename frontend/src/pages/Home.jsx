import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="container d-flex justify-between align-center">
          <div className="landing-nav-logo">
            <i className="fas fa-wallet"></i> BudgetBuddy
          </div>
          <div className="d-flex gap-4">
            <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="container">
          <div className="badge badge-info mb-4" style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}>
            <i className="fas fa-shield-halved"></i> 100% Secure Personal Finance Tracker
          </div>
          <h1 className="landing-hero-headline">
            Take Control of Your <span style={{ color: 'var(--primary)' }}>Personal Finances</span>
          </h1>
          <p className="landing-hero-subtitle">
            Track expenses, manage income, create monthly budgets, monitor spending, and achieve your financial goals—all in one secure place.
          </p>
          <div className="d-flex gap-4 justify-center">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
      </header>

      {/* Feature Grid Section */}
      <section className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Powerful Features</h2>
          <div className="feature-grid-3">
            {/* Card 1: Expense Tracking */}
            <div className="landing-feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-receipt"></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)' }}>Expense Tracking</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-normal)' }}>
                Easily log and categorize your daily transactions. Keep close tabs on where your money goes.
              </p>
            </div>

            {/* Card 2: Income Management */}
            <div className="landing-feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                <i className="fas fa-coins"></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)' }}>Income Management</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-normal)' }}>
                Record salaries, dividends, and freelance revenues. Monitor total monthly cash flows.
              </p>
            </div>

            {/* Card 3: Budget Planning */}
            <div className="landing-feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                <i className="fas fa-chart-pie"></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)' }}>Budget Planning</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-normal)' }}>
                Set monthly limits per category and compare actual expenses against targets with warning highlights.
              </p>
            </div>

            {/* Card 4: Dashboard Analytics */}
            <div className="landing-feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
                <i className="fas fa-desktop"></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)' }}>Dashboard Analytics</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-normal)' }}>
                A visual dashboard summarizing income, expense totals, remaining balance, and recent timeline records.
              </p>
            </div>

            {/* Card 5: Reports */}
            <div className="landing-feature-card">
              <div className="feature-icon-wrapper">
                <i className="fas fa-file-invoice-dollar"></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)' }}>Financial Reports</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-normal)' }}>
                Analyze monthly summaries and export performance parameters. Perfect for taxes and audits.
              </p>
            </div>

            {/* Card 6: Secure Authentication */}
            <div className="landing-feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
                <i className="fas fa-shield-halved"></i>
              </div>
              <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)' }}>JWT Security</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-normal)' }}>
                Secure token logins protect account details. Standardized hashing algorithms prevent data breaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose us section */}
      <section className="landing-section" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <h2 className="landing-section-title">Why Choose BudgetBuddy?</h2>
          <div className="feature-grid-3">
            <div className="text-center p-4">
              <i className="fas fa-bolt text-accent-color mb-4" style={{ fontSize: '2rem' }}></i>
              <h3 className="mb-2">Smart Expense Tracking</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>
                Keep every expense organized with category labels, custom date inputs, and descriptions.
              </p>
            </div>
            <div className="text-center p-4">
              <i className="fas fa-bullseye text-accent-color mb-4" style={{ fontSize: '2rem' }}></i>
              <h3 className="mb-2">Monthly Budget Planning</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>
                Create budget caps and monitor progress to avoid overspending on lifestyle choices.
              </p>
            </div>
            <div className="text-center p-4">
              <i className="fas fa-key text-accent-color mb-4" style={{ fontSize: '2rem' }}></i>
              <h3 className="mb-2">Secure Authentication</h3>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)' }}>
                JWT auth stores sessions securely in local storage, guaranteeing data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Dashboard Preview */}
      <section className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Dashboard Preview</h2>
          <div className="mock-dashboard-wrapper">
            <div className="d-flex justify-between align-center mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="d-flex align-center gap-2">
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--error)' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                <span className="font-semibold text-primary-color ml-2" style={{ fontSize: 'var(--text-sm)' }}>BudgetBuddy Web Panel</span>
              </div>
              <span className="badge badge-success">Live Session Secure</span>
            </div>

            {/* Static mock metrics grid */}
            <div className="grid-12 mb-6">
              <div className="card col-span-4" style={{ padding: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: '#FFFFFF', border: 'none' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.85 }}>Remaining Balance</span>
                <h3 className="m-0 mt-2" style={{ fontSize: 'var(--text-xl)', color: '#FFFFFF' }}>$5,230.50</h3>
              </div>
              <div className="card col-span-4" style={{ padding: '16px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Income</span>
                <h3 className="m-0 mt-2 text-success-color" style={{ fontSize: 'var(--text-xl)' }}>+$8,500.00</h3>
              </div>
              <div className="card col-span-4" style={{ padding: '16px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Expenses</span>
                <h3 className="m-0 mt-2 text-danger-color" style={{ fontSize: 'var(--text-xl)' }}>-$3,269.50</h3>
              </div>
            </div>

            {/* Static budget progress mockup */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="d-flex justify-between align-center mb-2">
                <span className="font-semibold text-primary-color" style={{ fontSize: 'var(--text-sm)' }}>Food Budget (July 2026)</span>
                <span className="font-semibold" style={{ fontSize: 'var(--text-xs)' }}>$380.00 / $500.00</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '76%', backgroundColor: 'var(--primary)' }}></div>
              </div>
              <span className="d-flex mt-2 font-medium text-success-color" style={{ fontSize: '10px' }}>🟢 Budget within safe limits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics counters section */}
      <section className="landing-section" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div className="landing-stat-card">
              <div className="landing-stat-value">1,500+</div>
              <div className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Expenses Managed</div>
            </div>
            <div className="landing-stat-card">
              <div className="landing-stat-value">850+</div>
              <div className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Budgets Created</div>
            </div>
            <div className="landing-stat-card">
              <div className="landing-stat-value">400+</div>
              <div className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Reports Generated</div>
            </div>
            <div className="landing-stat-card">
              <div className="landing-stat-value">100%</div>
              <div className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Secure Authentication</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA section */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-cta-banner">
            <h2 className="landing-cta-headline">Ready to manage your finances smarter?</h2>
            <p className="landing-cta-subtitle">
              Join thousands of users optimizing their budgets, tracking expenses, and hitting financial milestones.
            </p>
            <div className="d-flex gap-4 justify-center">
              <Link to="/register" className="btn btn-primary" style={{ backgroundColor: '#FFFFFF', color: 'var(--primary)' }}>Register Now</Link>
              <Link to="/login" className="btn btn-secondary" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', backgroundColor: 'transparent' }}>Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-container">
        <div className="container">
          <div className="landing-footer-grid">
            <div>
              <div className="landing-nav-logo mb-2">
                <i className="fas fa-wallet"></i> BudgetBuddy
              </div>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-sm)', maxWidth: '300px' }}>
                Personal Finance Management System designed for smart budget tracking.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-primary-color" style={{ fontSize: 'var(--text-sm)' }}>Tech Stack</h4>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.8' }}>
                React + Vite<br />
                Django REST Framework<br />
                SQLite Database<br />
                JWT Authentication
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-primary-color" style={{ fontSize: 'var(--text-sm)' }}>Application</h4>
              <p className="text-secondary-color" style={{ fontSize: 'var(--text-xs)' }}>
                Version 2.0.0 (Milestone 2)<br />
                Developed with Antigravity
              </p>
            </div>
          </div>

          <div className="text-center mt-8 pt-4" style={{ borderTop: '1px solid var(--border-color)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            &copy; 2026 BudgetBuddy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
