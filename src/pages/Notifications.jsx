import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Trash2, Package, MessageSquare, Star, AlertCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications?unreadOnly=${filter === 'unread'}&limit=50`);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.pagination.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      const deletedNotification = notifications.find(n => n._id === id);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearRead = async () => {
    if (window.confirm('Are you sure you want to clear all read notifications?')) {
      try {
        await api.delete('/notifications/clear-read');
        await fetchNotifications();
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_status: Package,
      new_message: MessageSquare,
      product_update: ShoppingBag,
      review: Star,
      system: AlertCircle
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      order_status: 'bg-blue-100 text-blue-600 border-blue-200',
      new_message: 'bg-purple-100 text-purple-600 border-purple-200',
      product_update: 'bg-green-100 text-green-600 border-green-200',
      review: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      system: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-lg font-normal text-blue-600">
                ({unreadCount} unread)
              </span>
            )}
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                >
                  Mark All Read
                </button>
                <button
                  onClick={handleClearRead}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Clear Read
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            </h2>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'You have no unread notifications'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const isUnread = !notification.read;

              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all ${
                    isUnread ? 'border-blue-300' : 'border-transparent'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition"
                              title="Mark as read"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {notification.link && (
                            <Link
                              to={notification.link}
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
