import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      console.log(response.data);

      setMessage(
        "Registration successful! Redirecting to login..."
      );

      // Give the user time to see the message
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.log(error);

      if (error.response?.data) {
        const data = error.response.data;

        // Convert Django/DRF validation errors into readable text
        if (typeof data === "object") {
          const errorText = Object.entries(data)
            .map(([field, errors]) => {
              const formattedErrors = Array.isArray(errors)
                ? errors.join(", ")
                : errors;

              return `${field}: ${formattedErrors}`;
            })
            .join(" | ");

          setErrorMessage(errorText);
        } else {
          setErrorMessage(String(data));
        }

      } else {
        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );
      }
    }
  };

  return (
    <div
      className="container mt-5 mb-5"
      style={{ maxWidth: "600px" }}
    >

      <div className="card shadow p-4">

        <h2 className="text-center text-success mb-4">
          Create Account
        </h2>

        {/* ============================= */}
        {/* Success Message */}
        {/* ============================= */}

        {message && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            <strong>✅ Success:</strong>{" "}
            {message}

            <button
              type="button"
              className="btn-close"
              onClick={() => setMessage("")}
            ></button>
          </div>
        )}

        {/* ============================= */}
        {/* Error Message */}
        {/* ============================= */}

        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <strong>❌ Error:</strong>{" "}
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

        <form onSubmit={handleSubmit}>

          {/* Full Name */}

          <div className="mb-3">

            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              name="fullname"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />

          </div>

          {/* Username */}

          <div className="mb-3">

            <label className="form-label">
              Username
            </label>

            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />

          </div>

          {/* Email */}

          <div className="mb-3">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          {/* Confirm Password */}

          <div className="mb-3">

            <label className="form-label">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

          {/* Register Button */}

          <button
            type="submit"
            className="btn btn-success w-100"
          >
            Register
          </button>

        </form>

        <p className="text-center mt-3">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;