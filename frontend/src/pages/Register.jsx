import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        "http://127.0.0.1:8000/api/users/register/",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      console.error("Registration Error:", err);

      if (err.response?.data) {

        const data = err.response.data;

        if (typeof data === "object") {
          const messages = Object.values(data)
            .flat()
            .join(" ");

          setError(messages || "Registration failed.");
        } else {
          setError(data);
        }

      } else {
        setError("Unable to connect to the server.");
      }

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="register-page">

      {/* LEFT SIDE */}

      <div className="register-visual">

        <div className="visual-content">

          <div className="brand-mark">
            💰
          </div>

          <span className="visual-eyebrow">
            BUDGET BUDDY
          </span>

          <h1>
            Take control of
            <br />
            your money.
          </h1>

          <p>
            Track your income, manage expenses,
            plan budgets, and achieve your savings
            goals — all in one place.
          </p>

          <div className="visual-features">

            <div>
              <span>📊</span>
              <p>Smart financial analytics</p>
            </div>

            <div>
              <span>🎯</span>
              <p>Track your savings goals</p>
            </div>

            <div>
              <span>🔔</span>
              <p>Stay ahead with alerts</p>
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="register-form-section">

        <div className="register-card">

          <div className="register-mobile-brand">
            💰
          </div>

          <span className="register-eyebrow">
            CREATE ACCOUNT
          </span>

          <h2>
            Welcome to Budget Buddy
          </h2>

          <p className="register-subtitle">
            Start managing your finances smarter.
          </p>


          {/* ERROR */}

          {error && (

            <div className="register-alert error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="register-alert success">
              <span>✓</span>
              <p>{success}</p>
            </div>

          )}


          <form onSubmit={handleSubmit}>

            {/* USERNAME */}

            <div className="register-form-group">

              <label>
                Username
              </label>

              <div className="register-input-wrapper">

                <span>👤</span>

                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-form-group">

              <label>
                Email Address
              </label>

              <div className="register-input-wrapper">

                <span>✉️</span>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label>
                Password
              </label>

              <div className="register-input-wrapper">

                <span>🔒</span>

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

              <small>
                Password must contain at least 8 characters.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="register-form-group">

              <label>
                Confirm Password
              </label>

              <div className="register-input-wrapper">

                <span>🔐</span>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          <div className="register-divider">
            <span>Already have an account?</span>
          </div>


          <Link
            to="/login"
            className="login-link"
          >
            Login to your account
          </Link>


          <p className="register-footer">
            By creating an account, you agree to use
            Budget Buddy responsibly.
          </p>

        </div>

      </div>

    </div>

  );
}

export default Register;