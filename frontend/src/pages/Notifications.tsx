export const Notifications = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/40 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">Notifications</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">1 unread</h2>
        </div>
        <button className="inline-flex items-center justify-center rounded-2xl border border-indigo-500/30 bg-transparent px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/10">
          Mark all as read
        </button>
      </div>

      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/50">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-red-300">
              [Budget Alert]
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              New
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">Budget Alert: Food & Dining</h3>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              You have spent $130.00 on Food & Dining, which exceeds your budget of $120.00 for this period.
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">July 8, 2026 · 5:37 PM</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900">
                ✓ Read
              </button>
              <button className="rounded-2xl border border-red-500/30 bg-transparent px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10">
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
