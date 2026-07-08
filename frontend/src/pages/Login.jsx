import { useState } from "react";
import api from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("token/", {
        username,
        password,
      });

      alert("Login Successful!");
      console.log(response.data);
    } catch (error) {
  console.log(error.response);
  console.log(error.response?.data);
  alert(JSON.stringify(error.response?.data || error.message));
}
  };

  return (
    <div>
      <h1>BudgetBuddy Login</h1>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;