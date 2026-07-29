import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaWallet } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <FaWallet className="mx-auto text-5xl text-cyan-400 mb-4" />
          <h1 className="text-4xl font-bold text-white">BudgetBuddy</h1>
          <p className="text-gray-400 mt-2">Welcome back! Login to continue.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="text-gray-300 block mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-600 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl bg-slate-800 border border-slate-600 p-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-cyan-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        <p className="text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}