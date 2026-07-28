import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send username and password to Django JWT API
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username: username,
          password: password,
        }
      );

      // Save JWT tokens in browser
      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );

      // Go to Dashboard
      navigate("/");

    } catch (error) {
      console.error("Login Error:", error);

      setError(
        "Invalid username or password. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          💰
        </div>

        {/* Heading */}
        <h1>Welcome Back!</h1>

        <p>
          Login to manage your finances with BudgetBuddy.
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Username */}
          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />

          {/* Password */}
          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {/* Error Message */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"
            }
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;