import RegisterForm from "../components/auth/Registerform";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-green-600">
          BudgetBuddy 💰
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Create your account
        </p>

        <RegisterForm />

      </div>
    </div>
  );
}

export default Register;