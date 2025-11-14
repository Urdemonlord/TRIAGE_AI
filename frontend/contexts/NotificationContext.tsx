'use client';

/**
 * Notification Context
 * Provides real-time notification state and subscription management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  notificationService,
  Notification,
  NotificationType,
} from '@/lib/notifications-client';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, patient } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine user type and ID
  const userType = user?.user_metadata?.role === 'doctor' ? 'doctor' : 'patient';
  const userId = patient?.id || user?.id;

  /**
   * Fetch notifications
   */
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const data = await notificationService.getForUser(userId, userType);
      setNotifications(data);

      const count = await notificationService.getUnreadCount(userId, userType);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    if (!userId) return;

    const success = await notificationService.markAllAsRead(userId, userType);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;

    const success = await notificationService.delete(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    }
  };

  /**
   * Refresh notifications
   */
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  /**
   * Handle new notification (real-time callback)
   */
  const handleNewNotification = (notification: Notification) => {
    // Add to list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    showNotificationToast(notification);
  };

  /**
   * Show toast notification
   */
  const showNotificationToast = (notification: Notification) => {
    const emoji = getNotificationEmoji(notification.type);

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-2xl">{emoji}</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {notification.message.substring(0, 100)}
                  {notification.message.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              Tutup
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  };

  /**
   * Get emoji for notification type
   */
  const getNotificationEmoji = (type: NotificationType): string => {
    switch (type) {
      case 'red_case':
        return '🚨';
      case 'doctor_note':
        return '💬';
      case 'follow_up':
        return '⏰';
      case 'status_update':
        return '📋';
      default:
        return '🔔';
    }
  };

  /**
   * Initialize notifications and real-time subscription
   */
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = notificationService.subscribeToNotifications(
      userId,
      userType,
      handleNewNotification
    );

    // Cleanup on unmount
    return () => {
      notificationService.unsubscribe(channel);
    };
  }, [userId, userType]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
