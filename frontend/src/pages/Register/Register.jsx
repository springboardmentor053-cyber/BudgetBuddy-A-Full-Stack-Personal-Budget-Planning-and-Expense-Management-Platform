import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("https://budgetbuddy-backend-xtl4.onrender.com/api/users/register/", {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Automatically store user details on successful registration so profile picks it up
      const userData = response.data?.user || {
        name: formData.full_name,
        username: formData.username,
        email: formData.email,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">
            Join BudgetBuddy and start managing your finances.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="text-gray-300 mb-2 block">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-gray-300 mb-2 block">Username</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 mb-2 block">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@gmail.com"
                required
                className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 mb-2 block">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create Password"
                required
                className="w-full pl-12 pr-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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

          {/* Confirm Password */}
          <div>
            <label className="text-gray-300 mb-2 block">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-slate-900 font-bold transition"
          >
            Register
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}