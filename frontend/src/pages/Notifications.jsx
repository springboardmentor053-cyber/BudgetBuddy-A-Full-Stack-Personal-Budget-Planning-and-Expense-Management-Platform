import React, { useState, useEffect } from 'react';
import api from '../services/api';

const typeColors = {
  GOAL_CREATED: { bg: '#e0f2fe', text: '#0284c7', label: 'Goal Created' },
  GOAL_ACHIEVED: { bg: '#dcfce7', text: '#15803d', label: 'Goal Achieved' },
  GOAL_80_PERCENT: { bg: '#fef3c7', text: '#d97706', label: 'Goal 80%' },
  BUDGET_80_PERCENT: { bg: '#fef3c7', text: '#d97706', label: 'Budget 80%' },
  BUDGET_90_PERCENT: { bg: '#ffedd5', text: '#c2410c', label: 'Budget 90%' },
  BUDGET_EXCEEDED: { bg: '#fee2e2', text: '#dc2626', label: 'Budget Exceeded' },
  BUDGET_CREATED: { bg: '#e0e7ff', text: '#4338ca', label: 'Budget Created' },
  BUDGET_UPDATED: { bg: '#f3e8ff', text: '#7e22ce', label: 'Budget Updated' },
  BUDGET_DELETED: { bg: '#f1f5f9', text: '#475569', label: 'Budget Deleted' },
  EXPENSE_ADDED: { bg: '#fee2e2', text: '#b91c1c', label: 'Expense Added' },
  EXPENSE_UPDATED: { bg: '#fef3c7', text: '#b45309', label: 'Expense Updated' },
  EXPENSE_DELETED: { bg: '#f1f5f9', text: '#475569', label: 'Expense Deleted' },
  INCOME_ADDED: { bg: '#dcfce7', text: '#15803d', label: 'Income Added' },
  INCOME_UPDATED: { bg: '#e0f2fe', text: '#0369a1', label: 'Income Updated' },
  INCOME_DELETED: { bg: '#f1f5f9', text: '#475569', label: 'Income Deleted' },
};


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/');
      setNotifications(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      setSuccess('Marked as read.');
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read/');
      setSuccess('All notifications marked as read.');
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}/`);
      setSuccess('Notification deleted.');
      window.dispatchEvent(new CustomEvent('notification-updated'));
      fetchNotifications();
    } catch (err) {
      setError('Failed to delete notification.');
    }
  };


  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container">
      <header className="page-header d-flex justify-between align-center">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Alerts and updates on your goals and budget limits.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary">
            Mark All as Read ({unreadCount})
          </button>
        )}
      </header>

      {error && <div className="card mb-4" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>{error}</div>}
      {success && <div className="card mb-4" style={{ backgroundColor: '#f0fdf4', color: '#15803d', borderLeft: '4px solid #22c55e' }}>{success}</div>}

      {loading ? (
        <p className="text-secondary-color">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="card text-center p-6">
          <p className="text-secondary-color">No notifications available right now.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notifications.map((item) => {
            const badge = typeColors[item.notification_type] || { bg: '#f3f4f6', text: '#4b5563', label: item.notification_type };
            const formattedDate = new Date(item.created_at).toLocaleString();

            return (
              <div
                key={item.id}
                className="card p-4 d-flex justify-between align-center"
                style={{
                  backgroundColor: item.is_read ? 'var(--bg-card)' : 'var(--bg-tertiary)',
                  borderLeft: item.is_read ? '1px solid var(--border-color)' : '4px solid var(--primary)',
                }}
              >
                <div className="d-flex align-center gap-4">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      fontWeight: 'bold',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {badge.label}
                  </span>

                  <div>
                    <h4 className="m-0 mb-1" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      {item.title}
                      {!item.is_read && (
                        <span style={{ marginLeft: '8px', width: '8px', height: '8px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} />
                      )}
                    </h4>
                    <p className="m-0 text-secondary-color" style={{ fontSize: '13px' }}>{item.message}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                  </div>
                </div>

                <div className="d-flex align-center gap-2">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-danger"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
