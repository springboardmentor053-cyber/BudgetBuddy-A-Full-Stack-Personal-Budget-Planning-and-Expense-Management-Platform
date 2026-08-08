import { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchData = () => {
    api.get('/notifications/').then((res) => setNotifications(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/mark-read/`);
    fetchData();
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}/`);
    fetchData();
  };

  const priorityColor = { high: '#e74c3c', medium: '#f0a500', low: '#3ba55d' };

  return (
    <MainLayout>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>Notifications</h1>
      {notifications.length === 0 && <p style={{ color: '#8892a6' }}>No notifications yet.</p>}
      {notifications.map((n) => (
        <div key={n.id} className="card" style={{
          marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', opacity: n.is_read ? 0.6 : 1,
          borderLeft: `4px solid ${priorityColor[n.priority] || '#6c5ce7'}`
        }}>
          <div>
            <strong style={{ color: '#fff' }}>{n.title}</strong>
            <p style={{ color: '#8892a6', fontSize: '13px', margin: '4px 0' }}>{n.message}</p>
            <span style={{ fontSize: '11px', color: '#5a6478' }}>{new Date(n.created_at).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!n.is_read && (
              <button className="primary" onClick={() => markRead(n.id)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                Mark Read
              </button>
            )}
            <button className="danger" onClick={() => deleteNotif(n.id)}>Delete</button>
          </div>
        </div>
      ))}
    </MainLayout>
  );
}

export default Notifications;