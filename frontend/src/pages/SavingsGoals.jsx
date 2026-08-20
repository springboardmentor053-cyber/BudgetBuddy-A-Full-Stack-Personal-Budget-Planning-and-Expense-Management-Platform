import { useEffect, useState } from 'react';
import api from '../api/axios';

const initialForm = { title: '', target_amount: '', saved_amount: '0', target_date: '', description: '' };
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/savings/goals/');
      setGoals(Array.isArray(response.data) ? response.data : response.data?.results || []);
      setError('');
    } catch (requestError) {
      console.error('Unable to load savings goals', requestError);
      setError('Unable to load savings goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadGoals(); }, []);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submitGoal = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      ...form,
      target_amount: Number(form.target_amount),
      saved_amount: Number(form.saved_amount || 0),
    };
    try {
      if (editingId) await api.patch(`/api/savings/goals/${editingId}/`, payload);
      else await api.post('/api/savings/goals/', payload);
      resetForm();
      await loadGoals();
    } catch (requestError) {
      console.error('Unable to save savings goal', requestError);
      const details = requestError.response?.data;
      setError(details ? Object.values(details).flat().join(' ') : 'Unable to save this goal. Please review the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const editGoal = (goal) => {
    setEditingId(goal.id);
    setForm({
      title: goal.title || '', target_amount: goal.target_amount || '', saved_amount: goal.saved_amount || '0',
      target_date: goal.target_date || '', description: goal.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this savings goal? This cannot be undone.')) return;
    try {
      await api.delete(`/api/savings/goals/${id}/`);
      if (editingId === id) resetForm();
      setGoals((current) => current.filter((goal) => goal.id !== id));
    } catch (requestError) {
      console.error('Unable to delete savings goal', requestError);
      setError('Unable to delete this goal. Please try again.');
    }
  };

  return <div className="min-h-screen w-full max-w-7xl mx-auto p-4 pt-20 text-slate-100 sm:p-8">
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Savings planner</p>
      <h1 className="text-3xl font-extrabold text-white">Build Your Financial Future</h1>
      <p className="mt-2 text-sm text-slate-400">Set meaningful targets and keep every milestone in view.</p>
    </div>
    {error && <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
      <form onSubmit={submitGoal} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/20 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">{editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}</h2>{editingId && <button type="button" onClick={resetForm} className="text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>}</div>
        <Field label="Goal Title"><input required name="title" value={form.title} onChange={updateField} placeholder="e.g. Dream vacation" className="field" /></Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Target Amount"><input required min="0.01" step="0.01" type="number" name="target_amount" value={form.target_amount} onChange={updateField} placeholder="0.00" className="field" /></Field><Field label="Amount Saved"><input min="0" step="0.01" type="number" name="saved_amount" value={form.saved_amount} onChange={updateField} placeholder="0.00" className="field" /></Field></div>
        <Field label="Target Date"><input required type="date" name="target_date" value={form.target_date} onChange={updateField} className="field" /></Field>
        <Field label="Description (optional)"><textarea name="description" value={form.description} onChange={updateField} rows="4" placeholder="What is this goal for?" className="field resize-none" /></Field>
        <button disabled={submitting} className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60">{submitting ? 'Saving...' : editingId ? 'Update Goal' : 'Create Goal'}</button>
      </form>
      <section><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-white">Your Savings Goals</h2><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">{goals.length} Total</span></div>
        {loading ? <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-sm text-slate-500">Loading your goals...</div> : !goals.length ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center"><p className="font-semibold text-slate-300">No savings goals yet</p><p className="mt-1 text-sm text-slate-500">Create your first goal to start tracking progress.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{goals.map((goal) => <GoalCard key={goal.id} goal={goal} onEdit={editGoal} onDelete={deleteGoal} />)}</div>}
      </section>
    </div>
  </div>;
}

function Field({ label, children }) { return <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 space-y-1.5"><span>{label}</span>{children}</label>; }

function GoalCard({ goal, onEdit, onDelete }) {
  const saved = Number(goal.saved_amount || 0); const target = Number(goal.target_amount || 0);
  const progress = Math.max(0, Math.min(100, Number(goal.progress_percentage ?? (target ? saved / target * 100 : 0))));
  const remaining = Math.max(0, Number(goal.remaining_amount ?? target - saved));
  return <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors"><div className="flex gap-3 justify-between"><div><h3 className="font-bold text-slate-100">{goal.title}</h3><p className="mt-1 text-xs text-slate-500">Target date: {goal.target_date || 'Not set'}</p></div><span className="text-sm font-extrabold text-emerald-400">{progress.toFixed(0)}%</span></div>{goal.description && <p className="mt-3 text-sm leading-relaxed text-slate-400">{goal.description}</p>}<div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${progress}%` }} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><Amount label="Saved" value={saved} color="text-emerald-400" /><Amount label="Target" value={target} color="text-slate-200" /><Amount label="Remaining" value={remaining} color="text-amber-400" /></div><div className="mt-5 flex gap-2"><button onClick={() => onEdit(goal)} className="flex-1 rounded-lg border border-slate-700 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800">Edit</button><button onClick={() => onDelete(goal.id)} className="flex-1 rounded-lg border border-rose-500/30 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10">Delete</button></div></article>;
}

function Amount({ label, value, color }) { return <div><p className="text-slate-500">{label}</p><p className={`mt-1 font-bold ${color}`}>{money(value)}</p></div>; }
