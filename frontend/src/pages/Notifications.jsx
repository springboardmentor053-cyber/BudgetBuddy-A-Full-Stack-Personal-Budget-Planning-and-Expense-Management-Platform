import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Notifications() {
  const navigate = useNavigate();
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

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation(); // Prevents triggering notification click navigation
    try {
      await api.patch(`notifications/${id}/read/`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation(); // Prevents triggering notification click navigation
    try {
      await api.delete(`notifications/${id}/`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Helper to determine route based on notification data
  const getNotificationRoute = (notification) => {
    // 1. Check explicit backend 'type', 'category', or 'target_url' fields if provided
    const type = (notification.type || notification.category || '').toLowerCase();
    if (type.includes('budget')) return '/budgets';
    if (type.includes('expense')) return '/expenses';
    if (type.includes('income')) return '/income';
    if (type.includes('goal') || type.includes('saving')) return '/savings';
    if (type.includes('profile') || type.includes('user')) return '/profile';

    // 2. Fallback check: inspect title or message content for keywords
    const content = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
    if (content.includes('budget')) return '/budgets';
    if (content.includes('expense')) return '/expenses';
    if (content.includes('income')) return '/income';
    if (content.includes('goal') || content.includes('saving')) return '/savings';
    if (content.includes('profile') || content.includes('account')) return '/profile';

    return null; // Fallback if no matching route found
  };

  // Handle clicking on the notification item
  const handleNotificationClick = async (notification) => {
    // Automatically mark as read on click if it's unread
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Determine target page and navigate
    const targetRoute = getNotificationRoute(notification);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  // Badge styles based on Priority
  const getPriorityBadgeStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return { background: 'linear-gradient(135deg, #ff4d4d 0%, #f43f5e 100%)', color: 'white' };
      case 'MEDIUM':
        return { background: 'linear-gradient(135deg, #ff9f43 0%, #ff8906 100%)', color: 'white' };
      case 'LOW':
        return { background: 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)', color: 'white' };
      case 'CRITICAL':
      case 'URGENT':
        return { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white' };
      default:
        return { background: '#94a3b8', color: 'white' };
    }
  };

  // Get Left Accent Border Color
  const getBorderLeftColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#ff4d4d';
      case 'MEDIUM':
        return '#ff9f43';
      case 'LOW':
        return '#38b6ff';
      case 'CRITICAL':
      case 'URGENT':
        return '#7c3aed';
      default:
        return '#94a3b8';
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
    <MainLayout pageTitle="Notifications ">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%', fontFamily: 'sans-serif' }}>
        
        {/* Gradient Stat Cards matching Dashboard Style */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Green Gradient (Total Alerts) */}
          <div style={{
            background: 'linear-gradient(135deg, #2ecc71 0%, #10b981 100%)',
            borderRadius: '16px',
            padding: '22px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              TOTAL ALERTS
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{notifications.length}</div>
          </div>

          {/* Card 2: Red/Coral Gradient (Unread Alerts) */}
          <div style={{
            background: 'linear-gradient(135deg, #ff4d4d 0%, #f43f5e 100%)',
            borderRadius: '16px',
            padding: '22px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(244, 63, 94, 0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              UNREAD ALERTS
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{unreadCount}</div>
          </div>

          {/* Card 3: Cyan/Blue Gradient (Read & Cleared) */}
          <div style={{
            background: 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)',
            borderRadius: '16px',
            padding: '22px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              READ & CLEARED
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{readCount}</div>
          </div>

          {/* Card 4: Purple Gradient (Action Required) */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            borderRadius: '16px',
            padding: '22px 24px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(109, 40, 217, 0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              ACTION REQUIRED
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{unreadCount}</div>
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
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '700' }}>
              ⚡ System Activity Stream
            </h3>
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
                    background: filterStatus === status ? 'linear-gradient(135deg, #38b6ff 0%, #0284c7 100%)' : 'transparent',
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

        {/* Notifications Feed */}
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
                    onClick={() => handleNotificationClick(n)}
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
                      gap: '15px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
                            background: 'linear-gradient(135deg, #2ecc71 0%, #10b981 100%)', 
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
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          style={{ 
                            padding: '8px 14px', 
                            background: 'linear-gradient(135deg, #2ecc71 0%, #10b981 100%)', 
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
                        onClick={(e) => handleDelete(n.id, e)}
                        style={{ 
                          padding: '8px 12px', 
                          background: 'linear-gradient(135deg, #ff4d4d 0%, #f43f5e 100%)', 
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