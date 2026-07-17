import { Link, Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-semibold tracking-tight text-white">
            BudgetBuddy
          </Link>
          <p className="mt-2 text-sm text-slate-400">Plan smarter, spend wiser, save with confidence.</p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
