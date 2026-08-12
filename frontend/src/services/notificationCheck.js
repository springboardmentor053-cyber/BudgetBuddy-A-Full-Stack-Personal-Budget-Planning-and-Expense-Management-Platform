import api from './api';
import { toast } from 'react-toastify';

export const checkNewNotifications = async () => {
  try {
    const res = await api.get('/notifications/');
    const unread = res.data.filter((n) => !n.is_read);
    const lastSeenId = parseInt(localStorage.getItem('last_seen_notification_id') || '0');
    const newest = unread.filter((n) => n.id > lastSeenId);
    newest.forEach((n) => toast.info(`${n.title}: ${n.message}`));
    if (unread.length > 0) {
      localStorage.setItem('last_seen_notification_id', Math.max(...unread.map((n) => n.id)));
    }
    return unread.length;
  } catch {
    return 0;
  }
};