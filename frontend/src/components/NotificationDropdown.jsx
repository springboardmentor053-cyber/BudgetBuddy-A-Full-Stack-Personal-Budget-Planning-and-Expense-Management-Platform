import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBell, FiCheck, FiClock, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

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

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/');
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Unable to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

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

  const handleOpenCenter = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((value) => !value);
          if (!isOpen) {
            void loadNotifications();
          }
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800/80 bg-[#0f172a] text-slate-200 shadow-lg shadow-black/30 transition hover:border-[#00f5a0]/40 hover:text-emerald-300"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#00f5a0] px-1 text-[10px] font-black text-slate-950 shadow-[0_0_16px_rgba(0,245,160,0.65)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-40 w-96 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#131b2e] shadow-2xl shadow-black/50">
          <div className="border-b border-slate-800/80 bg-[#0f172a] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-400">Activity feed</p>
                <p className="mt-1 text-sm font-semibold text-white">Recent alerts</p>
              </div>
              <button
                type="button"
                onClick={handleOpenCenter}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 transition hover:text-emerald-300"
              >
                Center
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto bg-[#131b2e] px-2 py-2">
            {loading ? (
              <div className="px-3 py-8 text-center text-sm text-slate-400">Loading notifications…</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-400">No notifications yet.</div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkRead(item.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    item.is_read
                      ? 'border-slate-800/80 bg-[#111827]'
                      : 'border-l-4 border-[#00f5a0] bg-[#1a233a] shadow-[0_0_0_1px_rgba(0,245,160,0.14)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        {!item.is_read && <span className="h-2.5 w-2.5 rounded-full bg-[#00f5a0] shadow-[0_0_8px_rgba(0,245,160,0.9)]" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <FiClock className="h-3.5 w-3.5" />
                      <span className="text-[11px]">{formatTimeAgo(item.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                      {item.notification_type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleMarkRead(item.id);
                          }}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <FiCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(item.id);
                        }}
                        className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-1.5 text-slate-400 transition hover:border-rose-500/30 hover:text-rose-300"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
