import { useState } from "react";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function LoginForm() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await loginUser({
        username,
        password,
      });

      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );

      navigate("/dashboard");

    } catch (error) {

      console.error(error);
      alert("Invalid Username or Password");

    } finally {

      setLoading(false);

    }
  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* Username */}

      <div>

        <label className="block text-sm font-semibold text-gray-700 mb-2">

          Username

        </label>

        <div className="relative">

          <FaUser
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          />

        </div>

      </div>

      {/* Password */}

      <div>

        <label className="block text-sm font-semibold text-gray-700 mb-2">

          Password

        </label>

        <div className="relative">

          <FaLock
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
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
            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-4 text-gray-500"
          >

            {showPassword
              ? <FaEyeSlash />
              : <FaEye />}

          </button>

        </div>

      </div>

      {/* Remember */}

      <div className="flex justify-between items-center text-sm">

        <label className="flex items-center gap-2 cursor-pointer">

          <input
            type="checkbox"
            className="accent-indigo-600"
          />

          Remember Me

        </label>

        <button
          type="button"
          className="text-indigo-600 hover:underline"
        >

          Forgot Password?

        </button>

      </div>

      {/* Login */}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
      >

        {loading
          ? "Signing In..."
          : "Login"}

      </button>

    </form>

  );
}

export default LoginForm;