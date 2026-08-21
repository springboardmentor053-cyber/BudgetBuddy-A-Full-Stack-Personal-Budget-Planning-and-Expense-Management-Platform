import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import "../styles/register.css";

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
  const [loading, setLoading] = useState(false);


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  // =====================================================
  // REGISTER
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setErrorMessage("");


    // Password validation

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setErrorMessage(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const response = await api.post(
  "register/",
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


      setTimeout(() => {
        navigate("/login");
      }, 2000);


    } catch (error) {

      console.log(error);


      if (error.response?.data) {

        const data =
          error.response.data;


        if (
          typeof data === "object"
        ) {

          const errorText =
            Object.entries(data)
              .map(
                ([field, errors]) => {

                  const formattedErrors =
                    Array.isArray(errors)
                      ? errors.join(", ")
                      : errors;

                  return `${field}: ${formattedErrors}`;
                }
              )
              .join(" | ");


          setErrorMessage(
            errorText
          );

        } else {

          setErrorMessage(
            String(data)
          );

        }

      } else {

        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="register-page">

      <div className="register-wrapper">


        {/* =================================================
            BRAND PANEL
        ================================================= */}

        <div className="register-brand-panel">

          <div className="register-brand-content">

            <div className="register-logo">
              💰
            </div>

            <h1>
              Build better
              <span>money habits.</span>
            </h1>

            <p className="register-brand-description">
              Create your BudgetBuddy account and
              bring your income, expenses, budgets,
              and savings goals together.
            </p>


            <div className="register-benefits">

              <div className="register-benefit">

                <i className="bi bi-check2-circle"></i>

                Organize your finances

              </div>


              <div className="register-benefit">

                <i className="bi bi-graph-up-arrow"></i>

                Understand your spending

              </div>


              <div className="register-benefit">

                <i className="bi bi-bullseye"></i>

                Work toward your goals

              </div>

            </div>

          </div>


          <div className="register-panel-footer">
            Personal Budget Planning & Expense Management
          </div>

        </div>


        {/* =================================================
            FORM PANEL
        ================================================= */}

        <div className="register-form-panel">

          <div className="register-form-header">

            <span>
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Set up your BudgetBuddy account in a few simple steps.
            </p>

          </div>


          {/* =================================================
              SUCCESS
          ================================================= */}

          {message && (

            <div className="register-alert success">

              <i className="bi bi-check-circle-fill"></i>

              <span>
                {message}
              </span>

              <button
                type="button"
                onClick={() =>
                  setMessage("")
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (

            <div className="register-alert error">

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


          <form onSubmit={handleSubmit}>

            <div className="register-form-grid">


              {/* FULL NAME */}

              <div className="register-field register-field-full">

                <label>
                  Full Name
                </label>

                <div className="register-input-wrapper">

                  <i className="bi bi-person register-input-icon"></i>

                  <input
                    type="text"
                    name="fullname"
                    className="register-input"
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* USERNAME */}

              <div className="register-field">

                <label>
                  Username
                </label>

                <div className="register-input-wrapper">

                  <i className="bi bi-at register-input-icon"></i>

                  <input
                    type="text"
                    name="username"
                    className="register-input"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="register-field">

                <label>
                  Email Address
                </label>

                <div className="register-input-wrapper">

                  <i className="bi bi-envelope register-input-icon"></i>

                  <input
                    type="email"
                    name="email"
                    className="register-input"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="register-field">

                <label>
                  Password
                </label>

                <div className="register-input-wrapper">

                  <i className="bi bi-lock register-input-icon"></i>

                  <input
                    type="password"
                    name="password"
                    className="register-input"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="register-field">

                <label>
                  Confirm Password
                </label>

                <div className="register-input-wrapper">

                  <i className="bi bi-shield-lock register-input-icon"></i>

                  <input
                    type="password"
                    name="confirmPassword"
                    className="register-input"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <i className="bi bi-arrow-right"></i>
                </>
              )}

            </button>

          </form>


          {/* LOGIN */}

          <p className="register-login">

            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>

  );
}

export default Register;