import { Link } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-center px-16">

        <div className="max-w-md">

          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center mb-8">
            <FaWallet size={38} />
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Manage Your
            <br />
            Finances Smarter.
          </h1>

          <p className="text-gray-300 mt-8 text-lg leading-8">
            BudgetBuddy helps you track income, monitor expenses,
            manage budgets and achieve your financial goals—all
            from one clean dashboard.
          </p>

          <div className="mt-12 space-y-4">

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              Track Income & Expenses
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              Budget Planning
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              Financial Analytics
            </div>

          </div>

        </div>

      </div>

      {/* Right Side */}
      <div className="flex-1 flex justify-center items-center p-8">

        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-200 p-10">

          <div className="flex justify-center">

            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center">

              <FaWallet
                size={28}
                className="text-white"
              />

            </div>

          </div>

          <h1 className="text-3xl font-bold text-center mt-6">
            BudgetBuddy
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Welcome Back
          </p>

          <LoginForm />

          <div className="mt-8 text-center">

            <span className="text-gray-500">
              Don't have an account?
            </span>

            <Link
              to="/register"
              className="ml-2 text-indigo-600 font-semibold hover:underline"
            >
              Register
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;