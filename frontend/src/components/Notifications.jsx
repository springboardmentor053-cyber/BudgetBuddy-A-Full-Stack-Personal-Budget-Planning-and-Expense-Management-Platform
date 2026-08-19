import React, { useState, useEffect } from 'react';
import API from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await API.get('notifications/');
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (response.data.results) {
        setNotifications(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`notifications/${id}/mark-as-read/`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`notifications/${id}/`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Notifications Center</h3>

      <div style={{ marginTop: '20px' }}>
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div 
              key={item.id} 
              style={{
                padding: '14px 18px',
                marginBottom: '12px',
                borderRadius: '8px',
                background: item.is_read ? '#131722' : '#1e293b',
                borderLeft: item.is_read ? '4px solid #475569' : '4px solid #3b82f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '15px' }}>{item.title}</strong>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: item.priority === 'HIGH' ? '#ff3b6b' : item.priority === 'MEDIUM' ? '#eab308' : '#64748b',
                    color: '#fff' 
                  }}>
                    {item.priority}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '4px 0 0 0' }}>{item.message}</p>
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  {new Date(item.created_at).toLocaleString()}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!item.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(item.id)}
                    style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Mark Read
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#8c93a8' }}>No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;