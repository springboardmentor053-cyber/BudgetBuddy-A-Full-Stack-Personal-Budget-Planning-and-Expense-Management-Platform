function Register() {
  return (
    <div>
      <h1>Create Account</h1>
      <p>Start your BudgetBuddy journey</p>

      <input type="text" placeholder="Username" />
      <br /><br />

      <input type="email" placeholder="Email" />
      <br /><br />

      <input type="password" placeholder="Password" />
      <br /><br />

      <button>Register</button>

      <p>Already have an account? Login</p>
    </div>
  );
}

export default Register;