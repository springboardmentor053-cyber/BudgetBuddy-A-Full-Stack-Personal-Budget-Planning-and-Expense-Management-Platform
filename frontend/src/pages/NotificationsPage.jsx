import { useEffect, useMemo, useState } from 'react';
import { FiBell, FiCheck, FiFilter, FiTrash2 } from 'react-icons/fi';
import api from '../api/axios';

const FILTERS = ['ALL', 'UNREAD', 'BUDGET ALERTS', 'SAVINGS GOALS'];
const filterMap = {
  ALL: () => true,
  UNREAD: (item) => !item.is_read,
  'BUDGET ALERTS': (item) => item.notification_type === 'BUDGET_ALERT',
  'SAVINGS GOALS': (item) => item.notification_type === 'SAVINGS_GOAL',
};

const notificationLabel = (type) => ({
  BUDGET_ALERT: 'Budget Alert',
  SAVINGS_GOAL: 'Savings Goal',
  TRANSACTION: 'Transaction',
}[type] || 'Activity');

const formatTimeAgo = (value) => {
  if (!value) return 'Just now';

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/');
      setNotifications(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (error) {
      console.error('Unable to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(filterMap[activeFilter]);
  }, [activeFilter, notifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      setNotifications((previous) => previous.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    } catch (error) {
      console.error('Unable to mark notification as read', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}/`);
      setNotifications((previous) => previous.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Unable to delete notification', error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 overflow-x-hidden">
          <header className="rounded-[1.5rem] border border-slate-800/80 bg-[#131b2e] p-6 shadow-lg shadow-black/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">ACTIVITY LOG</p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Notification Center</h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-400">
                  Stay updated on budget limits, savings goals, and automated alerts.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-[#0f172a] px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00f5a0]/15 text-emerald-300">
                  <FiBell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{unreadCount} unread</p>
                  <p className="text-xs text-slate-400">Live from your account</p>
                </div>
              </div>
            </div>
          </header>

          <section className="rounded-[1.5rem] border border-slate-800/80 bg-[#131b2e] p-5 shadow-lg shadow-black/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                      activeFilter === filter
                        ? 'border-[#00f5a0]/60 bg-[#00f5a0]/10 text-emerald-300 shadow-[0_0_0_1px_rgba(0,245,160,0.14)]'
                        : 'border-slate-700/80 bg-[#0f172a] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-[#0f172a] px-3 py-2 text-sm text-slate-400">
                <FiFilter className="h-4 w-4" />
                <span>Live feed</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {loading ? (
              <div className="rounded-[1.25rem] border border-slate-800/80 bg-[#131b2e] p-8 text-center text-sm text-slate-400 shadow-lg shadow-black/40">
                Loading notifications…
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="rounded-[1.25rem] border border-slate-800/80 bg-[#131b2e] p-8 text-center text-sm text-slate-400 shadow-lg shadow-black/40">
                No notifications match this filter yet.
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-[1.25rem] border p-5 shadow-lg shadow-black/40 transition ${
                    item.is_read
                      ? 'border-slate-800/80 bg-[#131b2e]'
                      : 'border-[#00f5a0]/40 border-l-4 border-l-[#00f5a0] bg-[#1a233a]'
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-700/80 bg-[#0f172a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
                          {notificationLabel(item.notification_type)}
                        </span>
                        {!item.is_read && (
                          <span className="rounded-full border border-[#00f5a0]/30 bg-[#00f5a0]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                            UNREAD
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">{item.title}</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">{item.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-[#0f172a] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.priority === 'HIGH' ? 'bg-rose-400' : item.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        {item.priority}
                      </div>
                      <p className="text-sm text-slate-500">{formatTimeAgo(item.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                    <p className="text-sm text-slate-500">From {item.user || 'system'}</p>
                    <div className="flex flex-wrap justify-end gap-3">
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() => void handleMarkRead(item.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <FiCheck className="h-4 w-4" />
                          Mark as Read
                        </button>
                      )}
                      {item.is_read && (
                        <span className="flex items-center gap-1 px-3 text-xs text-slate-500">
                          <FiCheck className="h-3.5 w-3.5" />
                          Read
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#0f172a] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-500/30 hover:text-rose-300"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
    </div>
  );
}
