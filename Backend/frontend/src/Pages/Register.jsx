import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


function Register() {

  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);


  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");

    setSuccess("");

  };


  // =========================================================
  // HANDLE REGISTER
  // =========================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");


    // =======================================================
    // CHECK PASSWORD
    // =======================================================

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;

    }


    if (
      formData.password.length < 8
    ) {

      setError(
        "Password must be at least 8 characters long."
      );

      return;

    }


    setLoading(true);


    try {

      const username =
        formData.username.trim();

      const email =
        formData.email.trim();


      // =====================================================
      // CREATE ACCOUNT
      // =====================================================

      await axios.post(
        "http://127.0.0.1:8000/api/users/register/",
        {
          username: username,
          email: email,
          password: formData.password,
        }
      );


      // =====================================================
      // AUTOMATIC LOGIN
      // =====================================================

      const loginResponse =
        await axios.post(
          "http://127.0.0.1:8000/api/token/",
          {
            username: username,
            password: formData.password,
          }
        );


      // =====================================================
      // SAVE JWT TOKENS
      // =====================================================

      localStorage.setItem(
        "access",
        loginResponse.data.access
      );

      localStorage.setItem(
        "refresh",
        loginResponse.data.refresh
      );


      // =====================================================
      // SAVE USERNAME
      // =====================================================

      localStorage.setItem(
        "username",
        username
      );


      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Account created successfully! Opening your dashboard..."
      );


      // =====================================================
      // CLEAR FORM
      // =====================================================

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });


      // =====================================================
      // DASHBOARD
      // =====================================================

      setTimeout(() => {

        navigate("/dashboard");

      }, 800);


    } catch (err) {

      console.error(
        "Registration error:",
        err
      );


      // =====================================================
      // BACKEND ERROR
      // =====================================================

      if (err.response?.data) {

        const data =
          err.response.data;


        if (
          typeof data === "object"
        ) {

          const messages =
            Object.entries(data)
              .map(
                ([field, message]) => {

                  if (
                    Array.isArray(message)
                  ) {

                    return `${field}: ${message.join(
                      ", "
                    )}`;

                  }

                  return `${field}: ${message}`;

                }
              )
              .join(" | ");


          setError(
            messages ||
            "Unable to create account."
          );

        } else {

          setError(
            String(data)
          );

        }

      } else {

        setError(
          "Unable to connect to the server. Please make sure Django is running."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#F5F2EC]
        flex
        overflow-x-hidden
      "
    >

      {/* =====================================================
          LEFT BRANDING
      ====================================================== */}

      <div
        className="
          hidden
          lg:flex
          lg:w-1/2
          min-h-screen
          bg-[#92643E]
          relative
          overflow-hidden
          flex-col
          items-center
          justify-center
          px-12
          xl:px-20
          text-white
        "
      >

        <div
          className="
            absolute
            -top-32
            -left-32
            w-80
            h-80
            rounded-full
            bg-[#56061D]/20
          "
        />


        <div
          className="
            absolute
            -bottom-40
            -right-32
            w-96
            h-96
            rounded-full
            bg-[#101C2E]/15
          "
        />


        <div
          className="
            relative
            z-10
            w-full
            max-w-xl
            text-center
          "
        >

          {/* LOGO */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              mb-8
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-white
                flex
                items-center
                justify-center
                shadow-lg
              "
            >

              <span
                className="
                  text-[#56061D]
                  text-2xl
                  font-bold
                "
              >
                ₹
              </span>

            </div>


            <div className="text-left">

              <h2
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                "
              >
                BudgetBuddy
              </h2>


              <p
                className="
                  text-sm
                  text-white/75
                "
              >
                Personal Finance Manager
              </p>

            </div>

          </div>


          <h1
            className="
              text-4xl
              xl:text-5xl
              font-bold
              leading-tight
              tracking-tight
            "
          >
            Start Your
            <br />
            Financial Journey
          </h1>


          <p
            className="
              mt-6
              text-base
              xl:text-lg
              text-white/85
              leading-relaxed
              max-w-lg
              mx-auto
            "
          >
            Create your BudgetBuddy account and
            take control of your income, expenses,
            budgets, and financial goals.
          </p>


          {/* DASHBOARD PREVIEW */}

          <div
            className="
              mt-10
              mx-auto
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-4
              shadow-2xl
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <div
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-[#56061D]
                    flex
                    items-center
                    justify-center
                  "
                >

                  <span
                    className="
                      text-white
                      text-sm
                    "
                  >
                    ₹
                  </span>

                </div>


                <div className="text-left">

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-[#101C2E]
                    "
                  >
                    Financial Dashboard
                  </p>


                  <p
                    className="
                      text-[10px]
                      text-[#8B8175]
                    "
                  >
                    Your financial overview
                  </p>

                </div>

              </div>


              <div
                className="
                  w-8
                  h-2
                  rounded-full
                  bg-[#E5DDD2]
                "
              />

            </div>


            <div
              className="
                grid
                grid-cols-3
                gap-2
              "
            >

              <div
                className="
                  rounded-xl
                  bg-[#F3EBDD]
                  p-3
                  text-left
                "
              >

                <p
                  className="
                    text-[9px]
                    text-[#6F665B]
                  "
                >
                  Balance
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-[#101C2E]
                    mt-1
                  "
                >
                  ₹1,701
                </p>

              </div>


              <div
                className="
                  rounded-xl
                  bg-[#92643E]/10
                  p-3
                  text-left
                "
              >

                <p
                  className="
                    text-[9px]
                    text-[#6F665B]
                  "
                >
                  Income
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-[#92643E]
                    mt-1
                  "
                >
                  ₹11,500
                </p>

              </div>


              <div
                className="
                  rounded-xl
                  bg-[#56061D]/10
                  p-3
                  text-left
                "
              >

                <p
                  className="
                    text-[9px]
                    text-[#6F665B]
                  "
                >
                  Expenses
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-[#56061D]
                    mt-1
                  "
                >
                  ₹9,799
                </p>

              </div>

            </div>


            <div
              className="
                mt-3
                h-24
                rounded-xl
                bg-[#FAF8F4]
                p-3
                flex
                items-end
                gap-2
              "
            >

              <div
                className="
                  w-full
                  h-[35%]
                  rounded-t-md
                  bg-[#92643E]
                "
              />

              <div
                className="
                  w-full
                  h-[55%]
                  rounded-t-md
                  bg-[#92643E]
                "
              />

              <div
                className="
                  w-full
                  h-[45%]
                  rounded-t-md
                  bg-[#92643E]
                "
              />

              <div
                className="
                  w-full
                  h-[75%]
                  rounded-t-md
                  bg-[#56061D]
                "
              />

              <div
                className="
                  w-full
                  h-[60%]
                  rounded-t-md
                  bg-[#92643E]
                "
              />

              <div
                className="
                  w-full
                  h-[85%]
                  rounded-t-md
                  bg-[#56061D]
                "
              />

            </div>

          </div>


          <p
            className="
              mt-8
              text-sm
              text-white/80
            "
          >
            Manage your money. Plan your future.
          </p>

        </div>

      </div>


      {/* =====================================================
          REGISTER SECTION
      ====================================================== */}

      <div
        className="
          w-full
          lg:w-1/2
          min-h-screen
          flex
          items-center
          justify-center
          px-5
          py-8
          sm:px-10
          sm:py-10
          xl:px-20
          bg-[#F5F2EC]
        "
      >

        <div
          className="
            w-full
            max-w-md
          "
        >

          {/* MOBILE LOGO */}

          <div
            className="
              flex
              lg:hidden
              items-center
              gap-3
              mb-8
            "
          >

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-[#56061D]
                flex
                items-center
                justify-center
                shadow-md
                shrink-0
              "
            >

              <span
                className="
                  text-white
                  text-xl
                  font-bold
                "
              >
                ₹
              </span>

            </div>


            <div>

              <h2
                className="
                  text-xl
                  font-bold
                  text-[#101C2E]
                "
              >
                BudgetBuddy
              </h2>


              <p
                className="
                  text-xs
                  text-[#6F665B]
                "
              >
                Personal Finance Manager
              </p>

            </div>

          </div>


          {/* HEADING */}

          <div className="mb-8">

            <h1
              className="
                text-3xl
                md:text-4xl
                font-bold
                text-[#101C2E]
                tracking-tight
              "
            >
              Create Your Account
            </h1>


            <p
              className="
                mt-2
                text-[#6F665B]
              "
            >
              Start managing your finances with BudgetBuddy.
            </p>

          </div>


          {/* CARD */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              p-6
              sm:p-8
              shadow-[0_15px_40px_rgba(16,28,46,0.08)]
            "
          >

            {/* ERROR */}

            {error && (

              <div
                className="
                  mb-6
                  px-4
                  py-3
                  rounded-xl
                  bg-[#56061D]/10
                  border
                  border-[#56061D]/20
                  text-[#7A263D]
                  text-sm
                  leading-relaxed
                "
              >
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div
                className="
                  mb-6
                  px-4
                  py-3
                  rounded-xl
                  bg-[#8FB39B]/15
                  border
                  border-[#8FB39B]/30
                  text-[#5F8069]
                  text-sm
                  leading-relaxed
                "
              >
                {success}
              </div>

            )}


            <form
              onSubmit={handleRegister}
            >

              {/* USERNAME */}

              <div className="mb-5">

                <label
                  className="
                    block
                    mb-2
                    text-sm
                    font-medium
                    text-[#101C2E]
                  "
                >
                  Username
                </label>


                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="
                    w-full
                    bg-[#FAF8F4]
                    border
                    border-[#D8CFC3]
                    rounded-xl
                    px-4
                    py-3
                    text-[#101C2E]
                    placeholder-[#9A9085]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/15
                  "
                  placeholder="Enter username"
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="mb-5">

                <label
                  className="
                    block
                    mb-2
                    text-sm
                    font-medium
                    text-[#101C2E]
                  "
                >
                  Email
                </label>


                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="
                    w-full
                    bg-[#FAF8F4]
                    border
                    border-[#D8CFC3]
                    rounded-xl
                    px-4
                    py-3
                    text-[#101C2E]
                    placeholder-[#9A9085]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/15
                  "
                  placeholder="Enter your email"
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="mb-5">

                <label
                  className="
                    block
                    mb-2
                    text-sm
                    font-medium
                    text-[#101C2E]
                  "
                >
                  Password
                </label>


                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="
                    w-full
                    bg-[#FAF8F4]
                    border
                    border-[#D8CFC3]
                    rounded-xl
                    px-4
                    py-3
                    text-[#101C2E]
                    placeholder-[#9A9085]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/15
                  "
                  placeholder="Enter password"
                  required
                />


                <p
                  className="
                    text-xs
                    text-[#8B8175]
                    mt-2
                  "
                >
                  Password must be at least 8 characters.
                </p>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="mb-6">

                <label
                  className="
                    block
                    mb-2
                    text-sm
                    font-medium
                    text-[#101C2E]
                  "
                >
                  Confirm Password
                </label>


                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="
                    w-full
                    bg-[#FAF8F4]
                    border
                    border-[#D8CFC3]
                    rounded-xl
                    px-4
                    py-3
                    text-[#101C2E]
                    placeholder-[#9A9085]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/15
                  "
                  placeholder="Confirm your password"
                  required
                />

              </div>


              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-[#56061D]
                  hover:bg-[#6F0A27]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  transition
                  duration-200
                  shadow-md
                  hover:shadow-lg
                  cursor-pointer
                "
              >

                {loading
                  ? "Creating Account..."
                  : "Create Account"}

              </button>

            </form>


            {/* LOGIN */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-1
                mt-6
                pt-5
                border-t
                border-[#E5DDD2]
              "
            >

              <span
                className="
                  text-sm
                  text-[#6F665B]
                "
              >
                Already have an account?
              </span>


              <Link
                to="/login"
                className="
                  text-sm
                  font-semibold
                  text-[#56061D]
                  hover:text-[#92643E]
                  transition
                "
              >
                Log in
              </Link>

            </div>

          </div>


          <p
            className="
              text-center
              text-xs
              text-[#8B8175]
              mt-6
              leading-relaxed
            "
          >
            Create your account and start managing
            <br className="sm:hidden" />
            your finances smarter.
          </p>

        </div>

      </div>

    </div>

  );

}


export default Register;