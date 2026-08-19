import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "token/",
        {
          username,
          password,
        }
      );

      // =====================================================
      // SAVE JWT TOKENS
      // =====================================================

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // =====================================================
      // GO TO DASHBOARD
      // =====================================================

      navigate("/");

    } catch (error) {
      console.error("Login Error:", error);

      // =====================================================
      // LOGIN ERROR
      // =====================================================

      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid username or password.");
        } else {
          setError(
            "Unable to login. Please check your details and try again."
          );
        }
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">
          💰
        </div>

        {/* =================================================
            HEADING
        ================================================= */}

        <h1>
          Welcome Back! 👋
        </h1>

        <p className="login-subtitle">
          Login to manage your finances with BudgetBuddy.
        </p>

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form onSubmit={handleLogin}>

          {/* =================================================
              USERNAME
          ================================================= */}

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-field">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <p className="login-error">
              ⚠️ {error}
            </p>
          )}

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* =================================================
            REGISTER LINK
        ================================================= */}

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#6b7280"
          }}
        >

          <span>
            Don't have an account?{" "}
          </span>

          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              border: "none",
              background: "transparent",
              color: "#6366f1",
              fontWeight: "700",
              cursor: "pointer",
              padding: 0,
              fontSize: "14px"
            }}
          >
            Create Account
          </button>

        </div>

        {/* =================================================
            SECURITY
        ================================================= */}

        <p className="login-security">
          🔒 Your financial information is securely protected.
        </p>

      </div>

    </div>
  );
}

export default Login;
