import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and Sort states
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'UNREAD', 'READ'
  const [sortOrder, setSortOrder] = useState('NEWEST');   // 'NEWEST', 'OLDEST'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('notifications/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setNotifications(list);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`notifications/${id}/read/`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`notifications/${id}/`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Badge styles based on Priority
  const getPriorityBadgeStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return { background: '#e74c3c', color: 'white' };
      case 'MEDIUM':
        return { background: '#f39c12', color: 'white' };
      case 'LOW':
        return { background: '#3498db', color: 'white' };
      case 'CRITICAL':
      case 'URGENT':
      return  { background: '#c0392b', color: 'white' };
      default:
        return { background: '#95a5a6', color: 'white' };
    }
  };

  // Get Left Accent Border Color
  const getBorderLeftColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#e74c3c';
      case 'MEDIUM':
        return '#f39c12';
      case 'LOW':
        return '#3498db';
      case 'CRITICAL':
      case 'URGENT':
      return  '#c0392b';
      default:
        return '#95a5a6';
    }
  };

  // Filter and Sort logic
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (filterStatus === 'UNREAD') return !n.is_read;
        if (filterStatus === 'READ') return n.is_read;
        return true; // 'ALL'
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
      });
  }, [notifications, filterStatus, sortOrder]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  return (
    <MainLayout pageTitle="Notifications 🔔">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
        
        {/* Stat Cards matching Dashboard Style */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Green */}
          <div style={{
            backgroundColor: '#2ecc71',
            borderRadius: '12px',
            padding: '20px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '6px' }}>Total Alerts</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800' }}>{notifications.length}</div>
          </div>

          {/* Card 2: Red */}
          <div style={{
            backgroundColor: '#e74c3c',
            borderRadius: '12px',
            padding: '20px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '6px' }}>Unread Alerts</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800' }}>{unreadCount}</div>
          </div>

          {/* Card 3: Blue */}
          <div style={{
            backgroundColor: '#3498db',
            borderRadius: '12px',
            padding: '20px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '6px' }}>Read & Cleared</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800' }}>{readCount}</div>
          </div>

        </div>

        {/* Action Header & Filter Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: '#ffffff', 
          padding: '20px 25px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '700' }}>System Activity Stream</h3>
          </div>

          {/* Filter Tabs & Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
              {['ALL', 'UNREAD', 'READ'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: filterStatus === status ? '#3498db' : 'transparent',
                    color: filterStatus === status ? '#ffffff' : '#64748b',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ 
                padding: '9px 14px', 
                borderRadius: '10px', 
                border: '1px solid #e2e8f0', 
                background: '#ffffff',
                color: '#334155',
                fontWeight: '600',
                cursor: 'pointer', 
                outline: 'none',
                fontSize: '0.85rem'
              }}
            >
              <option value="NEWEST">Latest First ⬇️</option>
              <option value="OLDEST">Oldest First ⬆️</option>
            </select>
          </div>
        </div>

        {/* Notifications Card Feed */}
        <div style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>Loading alerts...</p>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '1.1rem' }}>
                {filterStatus === 'ALL' ? 'No notifications found!' : `No ${filterStatus.toLowerCase()} notifications found.`}
              </h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>You're all caught up with your recent activity.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredNotifications.map((n) => {
                const borderLeftColor = getBorderLeftColor(n.priority);
                return (
                  <div 
                    key={n.id}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: n.is_read ? '#f8fafc' : '#ffffff',
                      boxShadow: n.is_read ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                      borderStyle: 'solid',
                      borderWidth: '1px 1px 1px 6px',
                      borderColor: `${n.is_read ? '#f1f5f9' : '#e2e8f0'} ${n.is_read ? '#f1f5f9' : '#e2e8f0'} ${n.is_read ? '#f1f5f9' : '#e2e8f0'} ${borderLeftColor}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '15px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>{n.title}</h4>
                        
                        {/* Priority Tag */}
                        <span style={{ 
                          ...getPriorityBadgeStyle(n.priority), 
                          fontSize: '0.65rem', 
                          padding: '3px 10px', 
                          borderRadius: '20px', 
                          fontWeight: '800',
                          letterSpacing: '0.5px'
                        }}>
                          {n.priority}
                        </span>

                        {!n.is_read && (
                          <span style={{ 
                            background: '#2ecc71', 
                            color: 'white', 
                            fontSize: '0.65rem', 
                            padding: '3px 8px', 
                            borderRadius: '20px', 
                            fontWeight: '800',
                            letterSpacing: '0.5px'
                          }}>
                            NEW
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.92rem', lineHeight: '1.4' }}>{n.message}</p>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '500' }}>
                        📅 {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                      {!n.is_read && (
                        <button 
                          onClick={() => handleMarkAsRead(n.id)}
                          style={{ 
                            padding: '8px 14px', 
                            background: '#2ecc71', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem', 
                            fontWeight: '700'
                          }}
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(n.id)}
                        style={{ 
                          padding: '8px 12px', 
                          background: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontSize: '0.8rem', 
                          fontWeight: '700'
                        }}
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

      </div>
    </MainLayout>
  );
}

export default Notifications;