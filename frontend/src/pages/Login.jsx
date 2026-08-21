import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import "../styles/login.css";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {

      const response = await api.post(
  "login/",
  {
    username,
    password,
  }
);


      // Store authentication tokens

      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );


      // Go to dashboard

      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      setErrorMessage(
        "Invalid username or password."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-page">

      <div className="login-wrapper">


        {/* =================================================
            BRAND PANEL
        ================================================= */}

        <div className="login-brand-panel">

          <div className="login-brand-content">

            <div className="login-logo">
              💰
            </div>

            <h1>
              Welcome to
              <span>BudgetBuddy</span>
            </h1>

            <p className="login-brand-description">
              Your personal finance companion for
              smarter budgeting, spending, and saving.
            </p>


            <div className="login-benefits">

              <div className="login-benefit">

                <i className="bi bi-bar-chart-fill"></i>

                Track your financial progress

              </div>


              <div className="login-benefit">

                <i className="bi bi-wallet2"></i>

                Manage income and expenses

              </div>


              <div className="login-benefit">

                <i className="bi bi-piggy-bank-fill"></i>

                Build better savings habits

              </div>

            </div>

          </div>


          <div className="login-panel-footer">
            Personal Budget Planning & Expense Management
          </div>

        </div>


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <div className="login-form-panel">

          <div className="login-form-header">

            <span>
              ACCOUNT ACCESS
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to continue to BudgetBuddy.
            </p>

          </div>


          {/* ERROR */}

          {errorMessage && (

            <div className="login-error">

              <i className="bi bi-exclamation-circle-fill"></i>

              <span>
                {errorMessage}
              </span>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage("")
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

          )}


          <form onSubmit={handleLogin}>


            {/* USERNAME */}

            <div className="login-field">

              <label>
                Username
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-person login-input-icon"></i>

                <input
                  type="text"
                  className="login-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label>
                Password
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-lock login-input-icon"></i>

                <input
                  type="password"
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* LOGIN */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat"></i>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <i className="bi bi-arrow-right"></i>
                </>
              )}

            </button>

          </form>


          {/* REGISTER */}

          <p className="login-register">

            Don't have an account?{" "}

            <Link to="/register">
              Create an account
            </Link>

          </p>

        </div>

      </div>

    </div>

  );
}

export default Login;