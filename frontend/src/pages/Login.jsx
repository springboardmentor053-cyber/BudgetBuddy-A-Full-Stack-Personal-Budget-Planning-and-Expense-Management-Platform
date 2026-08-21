import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    try {
      const response = await api.post(
  "login/",
  {
    username,
    password,
  }
);

      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );

      // Navigate directly after successful login
      navigate("/dashboard");

    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Invalid username or password."
      );
    }
  };

  return (
    <div
      className="container mt-5"
      style={{ maxWidth: "500px" }}
    >

      <div className="card shadow p-4">

        <h2 className="text-center text-primary mb-4">
          Login
        </h2>

        {/* Error Message */}

        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <strong>❌ Login Failed:</strong>{" "}
            {errorMessage}

            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setErrorMessage("")
              }
            ></button>
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* Username */}

          <div className="mb-3">

            <label className="form-label">
              Username
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

          </div>

          {/* Password */}

          <div className="mb-3">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {/* Login Button */}

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-3">

          Don't have an account?{" "}

          <Link to="/register">
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;