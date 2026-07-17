import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Income', path: '/income' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Savings Goals', path: '/savings-goals' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Reports', path: '/reports' },
  { label: 'Profile', path: '/profile' },
  { label: 'Settings', path: '/settings' },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-8xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 flex-col rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/40 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12h6v6H6z" />
                <path d="M14 6h4v12h-4z" />
                <path d="M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">BudgetBuddy</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Financial hub</p>
            </div>
          </div>

          <nav className="mb-6 flex-1 space-y-1 text-sm">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? 'bg-indigo-500/15 text-white ring-1 ring-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-auto flex w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 flex flex-col gap-6">
          <header className="rounded-[2rem] border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">NOTIFICATIONS</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Budget Alert Center</h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 text-slate-300 transition hover:border-indigo-500/40 hover:text-indigo-200">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v1" />
                    <path d="M16.22 5.78l-.7.7" />
                    <path d="M21 12h-1" />
                    <path d="M19.07 18.36l-.7-.7" />
                    <path d="M12 21v-1" />
                    <path d="M7.78 18.36l.7-.7" />
                    <path d="M3 12h1" />
                    <path d="M4.93 5.64l.7.7" />
                    <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" />
                  </svg>
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/15">
                    {user?.username?.slice(0, 2).toUpperCase() ?? 'AB'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{user?.username ?? 'Admin'}</p>
                    <p className="text-xs text-slate-500">Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};
