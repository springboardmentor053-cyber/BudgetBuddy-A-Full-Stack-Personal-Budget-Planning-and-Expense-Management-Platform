import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";

function RegisterForm() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    try {

  await registerUser(formData);

  alert("Registration Successful!");

  navigate("/");

} catch (error: any) {

  console.log(error);

  if (error.response) {

    console.log(error.response.data);

    alert(JSON.stringify(error.response.data));

  } else {

    alert("Something went wrong");

  }

}

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <input
        type="text"
        name="username"
        placeholder="Username"
        className="w-full border rounded-lg p-3"
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full border rounded-lg p-3"
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        className="w-full border rounded-lg p-3"
        onChange={handleChange}
      />

      <input
        type="text"
        name="last_name"
        placeholder="Last Name"
        className="w-full border rounded-lg p-3"
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full border rounded-lg p-3"
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirm_password"
        placeholder="Confirm Password"
        className="w-full border rounded-lg p-3"
        onChange={handleChange}
        required
      />

      <button
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        Register
      </button>

      <p className="text-center">

        Already have an account?{" "}

        <Link
          to="/"
          className="text-blue-600 font-semibold"
        >
          Login
        </Link>

      </p>

    </form>

  );

}

export default RegisterForm;