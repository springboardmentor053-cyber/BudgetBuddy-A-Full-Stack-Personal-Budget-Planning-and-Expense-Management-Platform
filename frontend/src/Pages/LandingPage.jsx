import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiCreditCard,
  FiLock,
  FiPieChart,
  FiShield,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';

const valuePoints = [
  'Track income & expenses automatically',
  'Smart budget utilization alerts & email notifications',
  'Interactive visual analytics & monthly reports',
];

const badges = ['Secure JWT Auth', 'Real-Time Email Alerts', 'Interactive Charts', '100% Free & Open'];

const features = [
  {
    icon: FiShield,
    title: 'User Authentication & Security',
    description: 'JWT-based sessions and securely encrypted passwords protect every financial detail.',
  },
  {
    icon: FiCreditCard,
    title: 'Budget Planning & Alerts',
    description: 'Set category limits and receive useful alerts at 80%, 90%, and 100% of your budget.',
  },
  {
    icon: FiBarChart2,
    title: 'Dynamic Visual Analytics',
    description: 'Turn daily activity into clear income, expense, doughnut, and bar-chart insights.',
  },
  {
    icon: FiTarget,
    title: 'Savings Goals Tracking',
    description: 'Keep meaningful targets in sight with simple, motivating completion progress.',
  },
];

function Metric({ label, value, tone = 'text-white' }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/70 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-[#0f172a]/95 p-4 shadow-2xl shadow-emerald-950/30 backdrop-blur sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-slate-950"><FiCreditCard /></span>
            <div><p className="text-xs font-bold text-white">Your financial overview</p><p className="text-[10px] text-slate-500">August 2026</p></div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">Live</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Metric label="Total Balance" value="₹65,000" tone="text-emerald-300" />
          <Metric label="Monthly Income" value="₹80,000" />
          <Metric label="Expenses" value="₹15,000" tone="text-rose-300" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.15fr]">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-200">Spending by category</p><FiPieChart className="text-emerald-400" /></div>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full" style={{ background: 'conic-gradient(#10b981 0 42%, #38bdf8 42% 67%, #f59e0b 67% 84%, #334155 84% 100%)' }}>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-[10px] font-bold text-white">₹15K</div>
              </div>
              <div className="space-y-1.5 text-[10px] text-slate-400"><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />Food 42%</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />Bills 25%</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />Travel 17%</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-200">Monthly trend</p><FiTrendingUp className="text-emerald-400" /></div>
            <div className="relative mt-5 h-20 overflow-hidden">
              <svg viewBox="0 0 240 80" className="h-full w-full" aria-label="Rising monthly trend line" role="img"><defs><linearGradient id="trend" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#10b981" stopOpacity=".28" /><stop offset="1" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs><path d="M0,67 C20,60 29,65 47,49 S77,57 94,42 S125,47 140,28 S170,39 188,20 S218,24 240,7 L240,80 L0,80 Z" fill="url(#trend)" /><path d="M0,67 C20,60 29,65 47,49 S77,57 94,42 S125,47 140,28 S170,39 188,20 S218,24 240,7" fill="none" stroke="#34d399" strokeWidth="3" /></svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-slate-600"><span>Week 1</span><span>Week 4</span></div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-200">Emergency fund</span><span className="font-bold text-emerald-300">80% complete</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-300" /></div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b1120] text-slate-100 selection:bg-emerald-400 selection:text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-[#0b1120]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-900/30"><FiCreditCard /></span>BudgetBuddy</Link>
          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">{['Features', 'How It Works', 'Analytics', 'Security'].map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} className="transition hover:text-emerald-300">{item}</a>)}</div>
          <div className="flex items-center gap-2 sm:gap-3"><Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white sm:px-4">Sign In</Link><Link to="/register" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400 sm:px-4">Get Started</Link></div>
        </nav>
      </header>

      <main>
        <section className="relative isolate"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.09),transparent_22%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
            <div><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Your money, finally in focus</p><h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">Personal Finance, <span className="text-emerald-400">Simplified.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Track income & expenses, plan budgets with real-time threshold alerts, and reach your savings goals — all in one unified platform.</p>
              <ul className="mt-7 space-y-3">{valuePoints.map((point) => <li key={point} className="flex items-start gap-3 text-sm text-slate-300"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300"><FiCheck size={13} /></span>{point}</li>)}</ul>
              <div className="mt-9 flex flex-wrap gap-3"><Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-400">Get Started Free <FiArrowRight /></Link><Link to="/login" className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-800">Sign In</Link></div>
              <div className="mt-9 flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-400">{badge}</span>)}</div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section id="features" className="border-y border-slate-800/80 bg-slate-950/35 py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">One flow, start to finish</p><h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Build a calmer relationship with money.</h2><p className="mt-4 text-slate-400">Everything you need to see where your money goes, make a plan, and follow through.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 transition hover:-translate-y-1 hover:border-emerald-500/40"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400"><Icon /></span><h3 className="mt-5 font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}</div></div></section>
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">How it works</p><h2 className="mt-3 text-3xl font-bold text-white">Start making every rupee count.</h2><div className="mt-8 grid gap-5 text-left sm:grid-cols-3">{[['01', 'Create your free account'], ['02', 'Add your income, expenses and budgets'], ['03', 'Act on insights and stay on target']].map(([number, text]) => <div key={number} className="border-l border-emerald-500/50 pl-4"><span className="text-xs font-bold text-emerald-400">{number}</span><p className="mt-2 font-semibold text-slate-200">{text}</p></div>)}</div></section>
        <section id="analytics" className="sr-only">Interactive analytics are available inside your BudgetBuddy dashboard.</section><section id="security" className="sr-only">BudgetBuddy uses JWT authentication and encrypted passwords.</section>
      </main>
      <footer className="border-t border-slate-800 bg-slate-950/60"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8"><span className="font-semibold text-slate-300">BudgetBuddy</span><span>© 2026 BudgetBuddy. Built for full-stack financial planning.</span><span className="inline-flex items-center justify-center gap-1 text-slate-400"><FiLock size={13} /> Financial clarity, securely.</span></div></footer>
    </div>
  );
}
