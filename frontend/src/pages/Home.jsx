import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  return (
    <div className="home-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="home-navbar">

        <div className="home-brand">

          <div className="home-brand-icon">
            💰
          </div>

          <div>
            <div className="home-brand-name">
              BudgetBuddy
            </div>

            <span className="home-brand-subtitle">
              Personal Finance
            </span>
          </div>

        </div>


        <div className="home-nav-actions">

          <Link
            to="/login"
            className="home-login-btn"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="home-register-btn"
          >
            Get Started
          </Link>

        </div>

      </nav>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="home-hero">

        <div className="home-hero-content">

          <div className="home-eyebrow">
            <i className="bi bi-stars"></i>
            Smart Personal Finance
          </div>

          <h1>
            Take control of your
            <span> money.</span>
          </h1>

          <p className="home-hero-description">
            BudgetBuddy helps you track income, manage expenses,
            plan budgets, build savings goals, and understand
            your financial habits — all in one place.
          </p>


          <div className="home-hero-actions">

            <Link
              to="/register"
              className="home-primary-btn"
            >
              Start Managing Money
              <i className="bi bi-arrow-right"></i>
            </Link>

            <Link
              to="/login"
              className="home-secondary-btn"
            >
              <i className="bi bi-box-arrow-in-right"></i>
              Sign In
            </Link>

          </div>

        </div>


        {/* =================================================
            DASHBOARD PREVIEW
        ================================================= */}

        <div className="home-visual">

          <div className="home-dashboard-card">

            <div className="home-dashboard-top">

              <div className="home-dashboard-title">
                Financial Overview
              </div>

              <div className="home-dashboard-month">
                This Month
              </div>

            </div>


            <div className="home-balance-card">

              <div className="home-balance-label">
                Available Balance
              </div>

              <div className="home-balance-value">
                ₹42,580
              </div>

              <div className="home-balance-change">
                <i className="bi bi-arrow-up"></i>
                12.5% from last month
              </div>

            </div>


            <div className="home-mini-grid">

              <div className="home-mini-card">

                <div className="home-mini-label">
                  INCOME
                </div>

                <div className="home-mini-value income">
                  ₹65,000
                </div>

              </div>


              <div className="home-mini-card">

                <div className="home-mini-label">
                  EXPENSES
                </div>

                <div className="home-mini-value expense">
                  ₹22,420
                </div>

              </div>

            </div>


            <div className="home-chart">

              <div className="home-chart-bar"></div>
              <div className="home-chart-bar"></div>
              <div className="home-chart-bar"></div>
              <div className="home-chart-bar"></div>
              <div className="home-chart-bar"></div>
              <div className="home-chart-bar active"></div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          FEATURES
      ================================================= */}

      <section className="home-features">

        <div className="home-section-heading">

          <span>
            EVERYTHING YOU NEED
          </span>

          <h2>
            Manage your finances with confidence
          </h2>

          <p>
            Keep your financial life organized with simple,
            focused tools designed to help you make better
            decisions.
          </p>

        </div>


        <div className="home-feature-grid">

          <div className="home-feature-card">

            <div className="home-feature-icon">
              <i className="bi bi-wallet2"></i>
            </div>

            <h3>
              Income Tracking
            </h3>

            <p>
              Record and monitor your income sources
              so you always know how much money is coming in.
            </p>

          </div>


          <div className="home-feature-card">

            <div className="home-feature-icon">
              <i className="bi bi-receipt"></i>
            </div>

            <h3>
              Expense Management
            </h3>

            <p>
              Track your daily spending and understand
              where your money goes.
            </p>

          </div>


          <div className="home-feature-card">

            <div className="home-feature-icon">
              <i className="bi bi-piggy-bank"></i>
            </div>

            <h3>
              Savings Goals
            </h3>

            <p>
              Set meaningful savings targets and
              monitor your progress toward them.
            </p>

          </div>


          <div className="home-feature-card">

            <div className="home-feature-icon">
              <i className="bi bi-bar-chart-line"></i>
            </div>

            <h3>
              Financial Reports
            </h3>

            <p>
              Turn your financial data into useful
              insights with clear reports and charts.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section className="home-how">

        <div className="home-how-inner">

          <div className="home-section-heading">

            <span>
              SIMPLE PROCESS
            </span>

            <h2>
              Get started in three steps
            </h2>

            <p>
              BudgetBuddy keeps personal finance management
              simple and straightforward.
            </p>

          </div>


          <div className="home-steps">

            <div className="home-step">

              <div className="home-step-number">
                01
              </div>

              <h3>
                Create your account
              </h3>

              <p>
                Register your BudgetBuddy account
                and set up your profile.
              </p>

            </div>


            <div className="home-step">

              <div className="home-step-number">
                02
              </div>

              <h3>
                Track your finances
              </h3>

              <p>
                Add income, expenses, budgets,
                and savings goals.
              </p>

            </div>


            <div className="home-step">

              <div className="home-step-number">
                03
              </div>

              <h3>
                Understand your money
              </h3>

              <p>
                Use reports and insights to make
                smarter financial decisions.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          CTA
      ================================================= */}

      <section className="home-cta">

        <h2>
          Ready to take control of your finances?
        </h2>

        <p>
          Start organizing your income, expenses,
          budgets, and savings with BudgetBuddy.
        </p>

        <Link
          to="/register"
          className="home-primary-btn"
        >
          Create Your Free Account
          <i className="bi bi-arrow-right"></i>
        </Link>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="home-footer">

        <div>
          © 2026 <strong>BudgetBuddy</strong>
        </div>

        <div>
          Personal Budget Planning & Expense Management
        </div>

      </footer>

    </div>
  );
}

export default Home;