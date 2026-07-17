export const Expenses = () => {
  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">Expenses</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Spending history</h1>
      </div>
      <p className="text-sm leading-7 text-slate-300">
        Review your recent expenses and discover opportunities to optimize your budget across categories.
      </p>
    </div>
  );
};
