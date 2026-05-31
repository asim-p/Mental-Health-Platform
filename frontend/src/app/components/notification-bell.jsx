import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

const TYPE_STYLES = {
  APPOINTMENT_BOOKED: 'bg-blue-100 text-blue-700',
  APPOINTMENT_CONFIRMED: 'bg-green-100 text-green-700',
  APPOINTMENT_CANCELLED: 'bg-red-100 text-red-700',
  PAYMENT_RECEIVED: 'bg-yellow-100 text-yellow-700',
};

const TYPE_LABELS = {
  APPOINTMENT_BOOKED: 'Booking',
  APPOINTMENT_CONFIRMED: 'Confirmed',
  APPOINTMENT_CANCELLED: 'Cancelled',
  PAYMENT_RECEIVED: 'Payment',
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    api.notifications.getAll()
      .then((res) => { if (res.success) setNotifications(res.data); })
      .catch(() => {});

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join_user', user.id);

    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id?.toString() === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };


  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-green-600" />
              <span className="font-semibold text-gray-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const id = n.id || n._id?.toString();
                const typeStyle = TYPE_STYLES[n.type] || 'bg-gray-100 text-gray-600';
                const typeLabel = TYPE_LABELS[n.type] || n.type;

                return (
                  <div
                    key={id}
                    onClick={() => !n.isRead && handleMarkAsRead(id)}
                    className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                      !n.isRead
                        ? 'bg-green-50/50 hover:bg-green-50 cursor-pointer'
                        : 'hover:bg-gray-50 cursor-default'
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {!n.isRead ? (
                        <span className="w-2 h-2 bg-green-500 rounded-full block" />
                      ) : (
                        <span className="w-2 h-2 bg-transparent rounded-full block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeStyle}`}>
                          {typeLabel}
                        </span>
                        {!n.isRead && (
                          <span className="text-[10px] text-green-600 font-medium">New</span>
                        )}
                      </div>
                      <p className={`text-sm text-gray-800 ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
